import express from "express";
import productsController from "../controllers/products.controller";
const router = express.Router();

router.get("/list", productsController.getAll);
router.get("/:id", productsController.get);
router.get("/", productsController.getPaginated);
router.post("/", productsController.create);
router.patch("/:id", productsController.update);
router.delete("/:id", productsController.delete);

export default router;
