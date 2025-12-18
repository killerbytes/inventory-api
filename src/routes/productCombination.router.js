const express = require("express");
const combinationController = require("../controllers/productCombination.controller");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.get(
  "/search",
  verifyToken({ maxAge: "999h" }),
  combinationController.search
);
router.post("/updatePrices", verifyToken(), combinationController.updatePrices);
router.post("/bulkGet", verifyToken(), combinationController.bulkGet);
router.get(
  "/bulkUpdateSKU",
  verifyToken(),
  combinationController.bulkUpdateSKU
);
router.post("/breakPack", verifyToken(), combinationController.breakPack);
router.post(
  "/stockAdjustment",
  verifyToken(),
  combinationController.stockAdjustment
);
router.get("/list", verifyToken(), combinationController.list);
router.get("/:id", verifyToken(), combinationController.get);
router.get("/product/:id", verifyToken(), combinationController.getByProductId);
router.patch(
  "/product/:id",
  verifyToken(),
  combinationController.updateByProductId
);
router.delete("/:id", verifyToken(), combinationController.delete);

module.exports = router;
