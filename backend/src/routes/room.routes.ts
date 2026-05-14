import { Router } from "express";

const router = Router();

import { authMiddleware } from "../middlewares/auth.middleware";
import { roomController } from "../controllers/room.controller";

router.post("/", authMiddleware, roomController.createRoom);

export default router;