import express from "express";
import variantTypesController from "../controllers/variantTypes.controller";
const router = express.Router();

router.post("/", variantTypesController.create);
router.get("/:id", variantTypesController.getByProductId);
router.get("/", variantTypesController.getAll);
router.patch("/:id", variantTypesController.update);
router.delete("/:id", variantTypesController.delete);

export default router;
