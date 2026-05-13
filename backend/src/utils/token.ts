import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";

interface JwtPayload {
    userId: string;
}

const expiresIn = Number(JWT_EXPIRES_IN);

export const tokenUtils = {
    generateToken(userId: string): string {
        return jwt.sign(
            { userId },
            JWT_SECRET,
            {
                expiresIn,
            }
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