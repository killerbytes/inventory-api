import express from "express";
import supplierController from "../controllers/supplier.controller";
const router = express.Router();

router.get("/list", supplierController.list);
router.get("/:id", supplierController.get);
router.get("/", supplierController.getPaginated);
router.post("/", supplierController.create);
router.patch("/:id", supplierController.update);
router.delete("/:id", supplierController.delete);

export default router;
