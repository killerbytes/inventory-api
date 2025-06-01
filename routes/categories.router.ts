import express from "express";
import categoriesController from "../controllers/categories.controller";

const router = express.Router();

router.get("/list", categoriesController.getAll);
router.get("/:id", categoriesController.get);
router.get("/", categoriesController.getPaginated);
router.post("/", categoriesController.create);
router.patch("/:id", categoriesController.update);
router.delete("/:id", categoriesController.delete);

export default router;
