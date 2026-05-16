import prisma from "../lib/prisma";
import { BadRequestError, ConflictError } from "../errors";

interface CreateRoomData {
    name: string;
    userId: string;
}

export const roomService = {
    async createRoom(roomData: CreateRoomData) {
        const { name, userId } = roomData;
        const roomName = name.trim();
        if (!roomName) {
            throw new BadRequestError("Room name cannot be empty");
        }
        const room = await prisma.room.create({
            data: {
                name: roomName,
            }
        });
        await prisma.roomMember.create({
            data: {
                roomId: room.id,
                userId,
            },
        });
        return room;
    },
    async getRooms(userId: string) {
        const rooms = await prisma.roomMember.findMany({
            where: {
                userId
            },
            include: {
                room: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return rooms;
    }
};

