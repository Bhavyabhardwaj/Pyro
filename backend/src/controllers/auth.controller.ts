import type { Request, Response, NextFunction } from "express";
import { authService } from "../services";
import { responseUtils } from "../utils";

export const authController = {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{
            const authResponse = await authService.registerUser(req.body);
            responseUtils.success(res, authResponse, "User registered successfully", 201);
        }
        catch (error) {
            next(error);
        }
    },
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authResponse = await authService.loginUser(req.body);
            responseUtils.success(res, authResponse, "User logged in successfully", 200);
        }
        catch (error) {
            next(error);
        }
    },
    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string | undefined;
            const meResponse = await authService.getMe(userId ?? "");
            responseUtils.success(res, meResponse, "User fetched successfully", 200);
        }
        catch (error) {
            next(error);
        }
    },
    async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string | undefined;
            const avatar = typeof req.body?.avatar === "string" ? req.body.avatar : null;
            const updateResponse = await authService.updateAvatar(userId ?? "", avatar);
            responseUtils.success(res, updateResponse, "Avatar updated successfully", 200);
        }
        catch (error) {
            next(error);
        }
    },
}