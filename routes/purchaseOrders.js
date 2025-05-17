const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrders");

router.get("/list", purchaseOrderController.getAll);
router.get("/:id", purchaseOrderController.get);
router.get("/", purchaseOrderController.getPaginated);
router.post("/", purchaseOrderController.create);
router.patch("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrderController.delete);
router.patch("/:id/status", purchaseOrderController.updateStatus);

module.exports = router;
