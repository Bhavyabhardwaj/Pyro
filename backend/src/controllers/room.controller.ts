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
    },
    async getRooms(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const rooms = await roomService.getRooms(userId);
            return responseUtils.success(res, rooms, "Rooms retrieved successfully");
        } catch (error) {
            next(error);
        }
    },
    async joinRoom(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.roomId;
            const userId = (req as any).user?.userId;
            
            await roomService.joinRoom(roomId, userId);
            return responseUtils.success(res, null, "Joined room successfully");
        } catch (error) {
            next(error);
        }
    }
}