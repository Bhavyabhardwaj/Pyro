import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roomController } from "../controllers/room.controller";

const router = Router();

router.post("/", authMiddleware, roomController.createRoom);
router.get("/", authMiddleware, roomController.getRooms);

export const roomRouter = router;