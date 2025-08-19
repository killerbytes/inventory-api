import express from "express";
import inventoryController from "../controllers/inventory.controller";
const router = express.Router();

router.post("/movements", inventoryController.getMovements);
router.post("/breakPacks", inventoryController.getBreakPacks);
router.post("/stockAdjustments", inventoryController.getStockAdjustments);
router.get("/", inventoryController.getPaginated);
router.post("/", inventoryController.create);
router.get("/list", inventoryController.list);
router.get("/:id", inventoryController.get);
// router.delete("/:id", inventoryController.delete);
// router.patch("/:id/price", inventoryController.updatePrice);

export default router;
