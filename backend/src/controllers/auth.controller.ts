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
}