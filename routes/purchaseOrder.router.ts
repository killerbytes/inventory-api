import express from "express";
import purchaseOrderController from "../controllers/purchaseOrder.controller";
const router = express.Router();

router.get("/list", purchaseOrderController.getAll);
router.get("/:id", purchaseOrderController.get);
router.get("/", purchaseOrderController.getPaginated);
router.post("/", purchaseOrderController.create);
router.patch("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrderController.delete);
router.patch("/:id/cancel", purchaseOrderController.cancelOrder);

export default router;
