const express = require("express");
const goodReceiptController = require("../controllers/goodReceipt.controller");
const router = express.Router();

router.post(
  "/getByProductCombination",
  goodReceiptController.getByProductCombination
);
router.post("/supplier/:id", goodReceiptController.getBySupplierId);
router.get("/list", goodReceiptController.list);
router.get("/:id", goodReceiptController.get);
router.get("/", goodReceiptController.getPaginated);
router.post("/", goodReceiptController.create);
router.patch("/:id", goodReceiptController.update);
router.delete("/:id", goodReceiptController.delete);
router.patch("/:id/cancel", goodReceiptController.cancelOrder);

module.exports = router;
