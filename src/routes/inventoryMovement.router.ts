import express from "express";
import inventoryMovementController from "../controllers/inventoryMovement.controller";
const router = express.Router();

router.get("/", inventoryMovementController.getPaginated);

export default router;
