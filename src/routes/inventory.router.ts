import express from "express";
import inventoryController from "../controllers/inventory.controller";
const router = express.Router();

router.post("/movements", inventoryController.getMovements);
router.get("/", inventoryController.getPaginated);
router.post("/", inventoryController.create);
router.get("/list", inventoryController.list);
router.get("/:id", inventoryController.get);
router.delete("/:id", inventoryController.delete);

export default router;
