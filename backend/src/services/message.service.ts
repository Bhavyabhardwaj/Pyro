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
    async getRoomMessages(roomId: string, userId: string) {
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
                createdAt: "asc",
            },
        });

        return messages;
    }
}