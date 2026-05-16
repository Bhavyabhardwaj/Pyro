import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roomController } from "../controllers/room.controller";

const router = Router();

router.post("/", authMiddleware, roomController.createRoom);
router.get("/", authMiddleware, roomController.getRooms);
router.post("/:roomId/join", authMiddleware, roomController.joinRoom);

export const roomRouter = router;