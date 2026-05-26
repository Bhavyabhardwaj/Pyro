import prisma from "../lib/prisma";

import { bcryptUtils, tokenUtils } from "../utils";

import { ConflictError, UnauthorizedError, BadRequestError } from "../errors";

import { LoginRequest, RegisterRequest, User } from "../types/api.types";

interface AuthResponse {
    token: string;
    user: Omit<User, "password">;
}

interface AvatarResponse {
    user: Omit<User, "password">;
}

export const authService = {
    async registerUser(userData: RegisterRequest): Promise<AuthResponse> {
        const email = userData.email.toLowerCase().trim();

        const username = userData.username.toLowerCase().trim();

        const password = userData.password.trim();

        if (!email || !username || !password) {
            throw new BadRequestError("All fields are required");
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new ConflictError("Email or username already exists");
        }

        const hashedPassword = await bcryptUtils.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });

        // Add the newly registered user to all existing public channels so they see them immediately
        const publicRooms = await prisma.room.findMany({
            where: { isDM: false },
            select: { id: true },
        });
        if (publicRooms.length > 0) {
            await prisma.roomMember.createMany({
                data: publicRooms.map((r) => ({
                    roomId: r.id,
                    userId: user.id,
                })),
                skipDuplicates: true,
            });
        }

        const token = tokenUtils.generateToken(user.id);

        const { password: _, ...safeUser } = user;

        return {
            token,
            user: safeUser,
        };
    },

    async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
        const email = loginData.email.toLowerCase().trim();

        const password = loginData.password.trim();

        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordValid = await bcryptUtils.comparePassword(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = tokenUtils.generateToken(user.id);

        const { password: _, ...safeUser } = user;

        return {
            token,
            user: safeUser,
        };
    },

    async getMe(userId: string): Promise<{ user: Omit<User, "password"> }> {
        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        const { password: _, ...safeUser } = user;

        return {
            user: safeUser,
        };
    },

    async updateAvatar(userId: string, avatar: string | null): Promise<AvatarResponse> {
        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        const normalizedAvatar = typeof avatar === "string" ? avatar.trim() : null;
        if (normalizedAvatar && normalizedAvatar.length > 2_000_000) {
            throw new BadRequestError("Avatar is too large");
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatar: normalizedAvatar || null },
        });

        const { password: _, ...safeUser } = user;

        return {
            user: safeUser,
        };
    },

    async getUsers(userId: string) {
        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        const users = await prisma.user.findMany({
            where: {
                NOT: {
                    id: userId,
                },
            },
            select: {
                id: true,
                username: true,
                avatar: true,
            },
            orderBy: {
                username: "asc",
            },
        });

        return users;
    },
};
