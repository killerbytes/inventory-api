const express = require("express");
const salesOrderController = require("../controllers/salesOrders.controller");
const router = express.Router();

router.get("/list", salesOrderController.list);
router.get("/:id", salesOrderController.get);
router.get("/", salesOrderController.getPaginated);
router.post("/", salesOrderController.create);
router.patch("/:id", salesOrderController.update);
router.delete("/:id", salesOrderController.delete);
router.patch("/:id/cancel", salesOrderController.cancelOrder);

module.exports = router;
