import { Router } from "express";
import { roomController } from "../controllers";
import { messageRoutes } from "./message.routes";
import { authMiddleware } from "../middlewares";


const router = Router();

router.post("/", authMiddleware, roomController.createRoom);
router.get("/", authMiddleware, roomController.getRooms);
router.post("/dm", authMiddleware, roomController.createDM);
router.post("/:roomId/join", authMiddleware, roomController.joinRoom);

router.use(
  "/:roomId/messages",
  messageRoutes
);

export const roomRouter = router;