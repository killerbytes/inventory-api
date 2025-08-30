const express = require("express");
const purchaseOrderController = require("../controllers/purchaseOrder.controller");
const router = express.Router();

router.get("/list", purchaseOrderController.list);
router.get("/:id", purchaseOrderController.get);
router.get("/", purchaseOrderController.getPaginated);
router.post("/", purchaseOrderController.create);
router.patch("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrderController.delete);
router.patch("/:id/cancel", purchaseOrderController.cancelOrder);

module.exports = router;
