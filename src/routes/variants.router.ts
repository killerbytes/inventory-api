import express from "express";
import variantsController from "../controllers/variants.controller";
const router = express.Router();

router.get("/list", variantsController.list);
router.get("/:id", variantsController.get);
router.get("/", variantsController.getPaginated);
router.post("/", variantsController.create);
router.patch("/:id", variantsController.update);
router.delete("/:id", variantsController.delete);

export default router;
