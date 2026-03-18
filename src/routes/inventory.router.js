const express = require("express");
const inventoryController = require("../controllers/inventory.controller");
const router = express.Router();

router.post("/movements", inventoryController.getMovements);
router.post("/break-packs", inventoryController.getBreakPacks);
router.post("/stock-adjustments", inventoryController.getStockAdjustments);
router.post("/price-history", inventoryController.getPriceHistory);
router.get("/reorder-levels", inventoryController.getReorderLevels);
router.get("/:id/return-transaction", inventoryController.getReturnTransaction);
router.get("/:id/return-items", inventoryController.getReturnItems);

module.exports = router;
