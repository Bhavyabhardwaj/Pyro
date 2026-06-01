import { NextFunction, Request, Response } from "express";
import { responseUtils } from "../utils";
import { aiService } from "../services/ai.service";

export const aiController = {
    async generateResponse(req: Request, res: Response, next: NextFunction) {
        try {
            const {prompt} = req.body;
            const reply = await aiService.generateResponse(prompt);
            return responseUtils.success(res, { reply }, "AI response generated successfully");
        } catch (error) {
            next(error);
        }
    },
    async summarizeRoom(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
        const userId = req.user?.userId;
        const { roomId } = req.params;

        const summary = await aiService.summarizeRoom(roomId, userId!);
        return responseUtils.success(res, { summary }, "Room summarized successfully");
    }
}