import { Router } from "express";

import { messageController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router({
  mergeParams: true,
});

router.post("/", authMiddleware, messageController.sendMessage);
router.get("/", authMiddleware, messageController.getRoomMessages);
router.patch("/:messageId", authMiddleware, messageController.editMessage);
router.delete("/:messageId", authMiddleware, messageController.deleteMessage);

export const messageRoutes = router;
