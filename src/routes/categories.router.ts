import express from "express";
import categoriesController from "../controllers/categories.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get("/list", categoriesController.list);
router.get("/:id", categoriesController.get);
router.get("/", categoriesController.getPaginated);
router.post("/", verifyToken, categoriesController.create);
router.patch("/updateSort", verifyToken, categoriesController.updateSort);
router.patch("/:id", verifyToken, categoriesController.update);
router.delete("/:id", verifyToken, categoriesController.delete);

export default router;
