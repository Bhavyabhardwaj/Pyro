import { NextFunction, Request, Response } from "express";
import { responseUtils } from "../utils";
import { messageService } from "../services/message.service";

export const messageController = {
    async sendMessage(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const roomId = req.params.roomId;
            const content = req.body.content;
            const attachments = req.body.attachments;

            const message = await messageService.sendMessage({ roomId, userId, content, attachments });
            return responseUtils.success(res, message, "Message sent successfully", 201);

        } catch (error) {
            next(error);
        }
    },
    async getRoomMessages(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const roomId = req.params.roomId;
            const { cursor, limit } = req.query;

            const messages = await messageService.getRoomMessages(roomId, userId, cursor as string | undefined, limit ? Number(limit) : 30);
            return responseUtils.success(res, messages, "Messages retrieved successfully");
        } catch (error) {
            next(error);
        }
    },
    async editMessage(req: Request<{ messageId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const messageId = req.params.messageId;
            const { content, roomId } = req.body;
            const updatedMessage = await messageService.editMessage(messageId, userId, content, roomId);
            return responseUtils.success(res, updatedMessage, "Message edited successfully");
        } catch (error) {
            next(error);
        }
    },
    async deleteMessage(req: Request<{ messageId: string }>, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.userId;
            const messageId = req.params.messageId;
            const { roomId } = req.body;
            const deletedMessage = await messageService.deleteMessage(messageId, userId, roomId);
            return responseUtils.success(res, deletedMessage, "Message deleted successfully");
        } catch (error) {
            next(error);
        }
    }
};