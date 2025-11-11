const express = require("express");
const inventoryController = require("../controllers/inventory.controller");
const router = express.Router();

router.post("/movements", inventoryController.getMovements);
router.post("/breakPacks", inventoryController.getBreakPacks);
router.post("/stockAdjustments", inventoryController.getStockAdjustments);
router.post("/priceHistory", inventoryController.getPriceHistory);
router.get("/reorderLevels", inventoryController.getReorderLevels);
router.get("/:id/return-transaction", inventoryController.getReturnTransaction);
router.get("/:id/return-items", inventoryController.getReturnItems);
// router.get("/", inventoryController.getPaginated);
// router.post("/", inventoryController.create);
// router.get("/list", inventoryController.list);
// router.get("/:id", inventoryController.get);
// router.delete("/:id", inventoryController.delete);
// router.patch("/:id/price", inventoryController.updatePrice);

module.exports = router;
