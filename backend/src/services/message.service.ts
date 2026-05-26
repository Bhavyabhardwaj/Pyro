import { BadRequestError } from "../errors";
import prisma from "../lib/prisma";
import { getIO } from "../socket";

interface AttachmentData {
    url: string;
    name: string;
    mime: string;
    size: number;
}

interface MessageData {
    roomId: string;
    userId: string;
    content: string;
    attachments?: AttachmentData[];
}

export const messageService = {
    async sendMessage(messageData: MessageData) {
        const { roomId, userId, content, attachments } = messageData;
        const messageContent = content.trim();

        if (!messageContent && (!attachments || attachments.length === 0)) {
            throw new BadRequestError("Message content or attachment is required");
        }
        const roomMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
        });
        if (!roomMember) {
            throw new BadRequestError("You are not a member of this room");
        }

        const message = await prisma.message.create({
            data: {
                content: messageContent || "Shared an attachment",
                room: {
                    connect: {
                        id: roomId,
                    },
                },
                author: {
                    connect: {
                        id: userId,
                    },
                },
                ...(attachments && attachments.length > 0 ? {
                    attachments: {
                        create: attachments.map((att) => ({
                            url: att.url,
                            fileName: att.name,
                            mimeType: att.mime,
                            fileSize: att.size,
                        }))
                    }
                } : {}),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    }
                },
                attachments: true
            }
        });

        // Update the lastMessageId on the Room
        await prisma.room.update({
            where: { id: roomId },
            data: { lastMessageId: message.id }
        });

        getIO().to(roomId).emit(
            "newMessage",
            message
        );

        return message;
    },
    async getRoomMessages(roomId: string, userId: string, cursor?: string, limit = 30) {
        const roomMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
        });
        if (!roomMember) {
            throw new BadRequestError("You are not a member of this room");
        }

        const messages = await prisma.message.findMany({
            where: {
                roomId,
                ...(cursor && { createdAt: { lt: new Date(cursor) } })
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    }
                },
                attachments: true
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit + 1,
        });
        const hasMore = messages.length > limit;
        if (hasMore) {
            messages.pop();
        }
        const reversedMessages = messages.reverse();

        return {
            messages: reversedMessages,
            nextCursor: reversedMessages.length > 0 ? reversedMessages[0]?.createdAt.toISOString() : null,
            hasMore,
        }
    },
    async editMessage(messageId: string, userId: string, content: string, roomId: string, ) {
            const updatedContent = content.trim();
            if (!updatedContent) {
                throw new BadRequestError("Message content cannot be empty");
            }
            const message = await prisma.message.findUnique({
                where: { id: messageId },
            });
            if (!message) {
                throw new BadRequestError("Message not found");
            }
            if (message.authorId !== userId) {
                throw new BadRequestError("You can only edit your own messages");
            }
            if(message.isDeleted){
                throw new BadRequestError("You cannot edit a deleted message");
            }
            const FIFTEEN_MINUTES = 15 * 60 * 1000;
            const isExpired = Date.now() - new Date(message.createdAt).getTime() > FIFTEEN_MINUTES;
            if (isExpired) {
                throw new BadRequestError("You can only edit messages within 15 minutes of sending");
            }

            const updatedMessage = await prisma.message.update({
                where: { id: messageId },
                data: {
                    content: updatedContent,
                    isEdited: true,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                    }
                },
                attachments: true
                }
            });
            getIO().to(roomId).emit(
                "messageUpdated",
                updatedMessage
            );
            return updatedMessage;
    },
    async deleteMessage(messageId: string, userId: string, roomId: string) {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new BadRequestError("Message not found");
        }
        if (message.authorId !== userId) {
            throw new BadRequestError("You can only delete your own messages");
        }
        if(message.isDeleted){
            throw new BadRequestError("Message is already deleted");
        }

        const deletedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                content: "This message has been deleted",
                isDeleted: true,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    }
                },
                attachments: true
            }
        });
        getIO().to(roomId).emit(
            "messageDeleted",
            deletedMessage
        );
        return deletedMessage;
    },
    async markAsRead(roomId: string, userId: string, messageId: string) {
        const roomMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
        });
        if (!roomMember) {
            throw new BadRequestError("You are not a member of this room");
        }

        await prisma.roomMember.update({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
            data: {
                lastReadMessageId: messageId
            }
        });

        getIO().to(roomId).emit(
            "messageRead",
            {
                userId,
                messageId,
            }
        );

        return { success: true };
    }
}