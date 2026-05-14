import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";

interface JwtPayload {
    userId: string;
}

export const tokenUtils = {
    generateToken(userId: string): string {
        const options: SignOptions = {
            expiresIn: JWT_EXPIRES_IN as any,
        };
        return jwt.sign(
            { userId },
            JWT_SECRET,
            options
        );
    },

    verifyToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(
                token,
                JWT_SECRET
            ) as JwtPayload;
        } catch {
            return null;
        }
    },
};