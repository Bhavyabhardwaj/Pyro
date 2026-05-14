import { Request, Response, NextFunction } from "express";
import { roomService } from "../services";
import { responseUtils } from "../utils";

export const roomController = {
    async createRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const name = req.body.name;
            const userId = (req as any).user?.userId;

            const room = await roomService.createRoom({ name, userId });

            return responseUtils.success(res, room, "Room created successfully", 201);
        } catch (error) {
            next(error);
        }
    }
}