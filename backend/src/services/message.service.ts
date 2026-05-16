import { BadRequestError } from "../errors";
import prisma from "../lib/prisma";

interface MessageData {
    roomId: string;
    userId: string;
    content: string;
}

export const messageService = {
    async sendMessage(messageData: MessageData) {
        const { roomId, userId, content } = messageData;
        const messageContent = content.trim();

        if (!messageContent) {
            throw new BadRequestError("Message content cannot be empty");
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
                content: messageContent,
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
            },
        });

        return message;
    }
}