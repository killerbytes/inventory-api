import express from "express";
import productCombinationController from "../controllers/productCombination.controller";
const router = express.Router();

router.post("/", productCombinationController.create);
router.get("/:id", productCombinationController.getByProductId);
router.patch("/:id", productCombinationController.update);
router.delete("/:id", productCombinationController.delete);

export default router;
