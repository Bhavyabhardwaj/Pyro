import { Router } from "express";
import { aiController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.post("/chat", authMiddleware, aiController.generateResponse);
router.post("/rooms/:roomId/summarize", authMiddleware, aiController.summarizeRoom);

export const aiRouter = router;