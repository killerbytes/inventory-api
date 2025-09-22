const express = require("express");
const productCombinationController = require("../controllers/productCombination.controller");
const router = express.Router();

router.post("/bulkGet", productCombinationController.bulkGet);
router.get("/bulkUpdateSKU", productCombinationController.bulkUpdateSKU);
router.post("/breakPack", productCombinationController.breakPack);
router.post("/stockAdjustment", productCombinationController.stockAdjustment);
router.get("/list", productCombinationController.list);
router.get("/:id", productCombinationController.get);
router.get("/product/:id", productCombinationController.getByProductId);
router.patch("/product/:id", productCombinationController.updateByProductId);
router.delete("/:id", productCombinationController.delete);

module.exports = router;
