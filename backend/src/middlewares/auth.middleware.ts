import type {  Response, NextFunction, Request } from "express";
import { tokenUtils } from "../utils";
import  { UnauthorizedError } from "../errors";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = (req.headers as any).authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Authorization header missing or malformed"));
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return next(new UnauthorizedError("Token not provided"));
    }
    const decoded = tokenUtils.verifyToken(token);
    if (!decoded) {
        return next(new UnauthorizedError("Invalid or expired token"));
    }
    req.user = {userId: decoded.userId};
    next();
}