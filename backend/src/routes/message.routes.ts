import { Router } from "express";

import { messageController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router({
  mergeParams: true,
});

router.post("/", authMiddleware, messageController.sendMessage);
router.get("/", authMiddleware, messageController.getRoomMessages);

export const messageRoutes = router;
