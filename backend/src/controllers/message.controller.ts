import { NextFunction, Request, Response } from "express";
import { responseUtils } from "../utils";
import { messageService } from "../services/message.service";

export const messageController = {
    async sendMessage(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const roomId = req.params.roomId;
            const content = req.body.content;

            const message = await messageService.sendMessage({ roomId, userId, content });
            return responseUtils.success(res, message, "Message sent successfully", 201);
            
        } catch (error) {
            next(error);
        }
    },
    async getRoomMessages(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const roomId = req.params.roomId;

            const messages = await messageService.getRoomMessages(roomId, userId);
            return responseUtils.success(res, messages, "Messages retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
};