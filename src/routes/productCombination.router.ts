import express from "express";
import productCombinationController from "../controllers/productCombination.controller";
const router = express.Router();

router.get("/:id", productCombinationController.get);
router.get("/product/:id", productCombinationController.getByProductId);
router.patch("/product/:id", productCombinationController.updateByProductId);
router.delete("/:id", productCombinationController.delete);
router.post("/breakPack", productCombinationController.breakPack);

export default router;
