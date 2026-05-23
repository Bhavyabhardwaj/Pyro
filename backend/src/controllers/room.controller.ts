import { Request, Response, NextFunction } from "express";
import { roomService } from "../services";
import { responseUtils } from "../utils";
import { getIO } from "../socket";
import { presenceService } from "../socket/presence";

export const roomController = {
    async createRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const name = req.body.name;
            const userId = (req as any).user?.userId;

            const room = await roomService.createRoom({ name, userId });

            // Notify all online sockets that a new channel was created
            try {
                const io = getIO();
                io.emit("roomCreated", room);
            } catch (err) {
                console.error("Failed to broadcast channel created event:", err);
            }

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
    },
    async createDM(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const targetUserId = req.body.targetUserId;

            const room = await roomService.createDM(userId, targetUserId);

            // Notify target user and sender in real-time via Socket
            try {
                const io = getIO();
                // Emit to target user
                const targetSocketId = presenceService.getSocketId(targetUserId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit("roomCreated", room);
                }
                // Emit to sender
                const senderSocketId = presenceService.getSocketId(userId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("roomCreated", room);
                }
            } catch (err) {
                console.error("Failed to broadcast DM created event:", err);
            }

            return responseUtils.success(res, room, "DM started successfully", 201);
        } catch (error) {
            next(error);
        }
    }
}