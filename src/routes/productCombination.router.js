const express = require("express");
const combinationController = require("../controllers/productCombination.controller");
const router = express.Router();

router.get("/search", combinationController.search);
router.post("/updatePrices", combinationController.updatePrices);
router.post("/bulkGet", combinationController.bulkGet);
router.get("/bulkUpdateSKU", combinationController.bulkUpdateSKU);
router.post("/breakPack", combinationController.breakPack);
router.post("/stockAdjustment", combinationController.stockAdjustment);
router.get("/list", combinationController.list);
router.get("/:id", combinationController.get);
router.get("/barcode/:barcode", combinationController.getByBarcode);
router.get("/product/:id", combinationController.getByProductId);
router.get("/category/:categoryId", combinationController.getByCategoryId);
router.patch("/product/:id", combinationController.updateByProductId);
router.patch("/", combinationController.update);
router.post("/", combinationController.create);
router.delete("/:id", combinationController.delete);

module.exports = router;
