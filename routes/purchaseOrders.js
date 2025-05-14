const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrders");
const { verifyToken } = require("../utils/jwt");

router.get("/list", verifyToken, purchaseOrderController.getAll);
router.get("/:id", purchaseOrderController.get);
router.get("/", purchaseOrderController.getPaginated);
router.post("/", purchaseOrderController.create);
router.patch("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrderController.delete);

module.exports = router;
