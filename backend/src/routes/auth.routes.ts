import { Router } from "express";
import { authController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.patch("/avatar", authMiddleware, authController.updateAvatar);

export const authRouter = router;