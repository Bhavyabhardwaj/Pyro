import prisma from "../lib/prisma";

import {
    bcryptUtils,
    tokenUtils,
} from "../utils";

import {
    ConflictError,
    UnauthorizedError,
    BadRequestError,
} from "../errors";

import {
    LoginRequest,
    RegisterRequest,
    User,
} from "../types/api.types";

interface AuthResponse {
    token: string;
    user: Omit<User, "password">;
}

export const authService = {
    async registerUser(
        userData: RegisterRequest
    ): Promise<AuthResponse> {
        const email = userData.email
            .toLowerCase()
            .trim();

        const username = userData.username
            .toLowerCase()
            .trim();

        const password = userData.password.trim();

        if (!email || !username || !password) {
            throw new BadRequestError(
                "All fields are required"
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictError(
                "Email or username already exists"
            );
        }

        const hashedPassword =
            await bcryptUtils.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });

        const token = tokenUtils.generateToken(user.id);

        const { password: _, ...safeUser } = user;

        return {
            token,
            user: safeUser,
        };
    },

    async loginUser(
        loginData: LoginRequest
    ): Promise<AuthResponse> {
        const email = loginData.email
            .toLowerCase()
            .trim();

        const password = loginData.password.trim();

        if (!email || !password) {
            throw new BadRequestError(
                "Email and password are required"
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedError(
                "Invalid email or password"
            );
        }

        const isPasswordValid =
            await bcryptUtils.comparePassword(
                password,
                user.password
            );

        if (!isPasswordValid) {
            throw new UnauthorizedError(
                "Invalid email or password"
            );
        }

        const token = tokenUtils.generateToken(user.id);

        const { password: _, ...safeUser } = user;

        return {
            token,
            user: safeUser,
        };
    },
};