import express from "express";
import productCombinationController from "../controllers/productCombination.controller";
const router = express.Router();

router.post("/breakPack", productCombinationController.breakPack);
router.post("/stockAdjustment", productCombinationController.stockAdjustment);
router.get("/:id", productCombinationController.get);
router.get("/product/:id", productCombinationController.getByProductId);
router.patch("/product/:id", productCombinationController.updateByProductId);
router.delete("/:id", productCombinationController.delete);

export default router;
