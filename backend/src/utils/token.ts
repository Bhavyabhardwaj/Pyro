import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

export const verifyToken = (token: string): string | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}