const express = require("express");
const router = express.Router();
const salesOrderController = require("../controllers/salesOrders");

router.get("/list", salesOrderController.getAll);
router.get("/:id", salesOrderController.get);
router.get("/", salesOrderController.getPaginated);
router.post("/", salesOrderController.create);
router.patch("/:id", salesOrderController.update);
router.delete("/:id", salesOrderController.delete);
// router.patch("/:id/status", salesOrderController.updateStatus);

module.exports = router;
