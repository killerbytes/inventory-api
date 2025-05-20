const express = require("express");
const router = express.Router();
const purchaseOrderItemsController = require("../controllers/purchaseOrderItems");

router.get("/list", purchaseOrderItemsController.getAll);
router.get("/:id", purchaseOrderItemsController.get);
router.get("/", purchaseOrderItemsController.getPaginated);
router.post("/", purchaseOrderItemsController.create);
router.patch("/:id", purchaseOrderItemsController.update);
router.delete("/:id", purchaseOrderItemsController.delete);

module.exports = router;
