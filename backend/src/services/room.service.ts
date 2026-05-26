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
                room: {
                    include: {
                        roomMembers: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatar: true,
                                    }
                                },
                                lastReadMessage: true
                            }
                        },
                        messages: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1,
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatar: true,
                                    }
                                }
                            }
                        },
                    }
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const roomWithUnreadCounts = await Promise.all(rooms.map(async(membership) => {
            const currentMember = membership.room.roomMembers.find(m => m.userId === userId);
            const lastReadCreatedAt = currentMember?.lastReadMessage?.createdAt;
            const unreadCount = await prisma.message.count({
                where: {
                    roomId: membership.roomId,
                    authorId:{ not: userId },   // don't count own messages as unread
                    ...(lastReadCreatedAt && {createdAt: { gt: lastReadCreatedAt }})
                }
            })
            return {
                ...membership,
                room: {
                    ...membership.room,
                    unreadCount,
                }
            }
        }));
        return roomWithUnreadCounts;
    },
    async createDM(userId: string, targetUserId: string) {
        if (!userId || !targetUserId) {
            throw new BadRequestError("Both participant IDs are required");
        }

        const existingDM = await prisma.room.findFirst({
            where: {
                isDM: true,
                AND: [
                    {
                        roomMembers: {
                            some: {
                                userId: userId
                            }
                        }
                    },
                    {
                        roomMembers: {
                            some: {
                                userId: targetUserId
                            }
                        }
                    }
                ]
            },
            include: {
                roomMembers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        if (existingDM) {
            return existingDM;
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser || !currentUser) {
            throw new BadRequestError("User not found");
        }

        const dmRoom = await prisma.room.create({
            data: {
                name: `dm-${currentUser.username}-${targetUser.username}`,
                isDM: true,
            }
        });

        await prisma.roomMember.createMany({
            data: [
                { roomId: dmRoom.id, userId: userId },
                { roomId: dmRoom.id, userId: targetUserId }
            ]
        });

        const finalRoom = await prisma.room.findUnique({
            where: { id: dmRoom.id },
            include: {
                roomMembers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        return finalRoom;
    },
    async joinRoom(roomId: string, userId: string) {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
            },
        });
        if (!room) {
            throw new BadRequestError("Room not found");
        }
        const existingMember = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    roomId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new ConflictError("User is already a member of this room");
        }
        const roomMember = await prisma.roomMember.create({
            data: {
                roomId,
                userId,
            },
        });
        return roomMember;
    }
};

