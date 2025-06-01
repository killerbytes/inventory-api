import express from "express";
import authController from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get("/me", verifyToken, authController.me);
router.post("/login", authController.login);

export default router;
