const express = require("express");
const repotsController = require("../controllers/reports.controller");
const router = express.Router();

router.get("/popular", repotsController.getPopularProducts);
router.get("/profit", repotsController.getProfitProducts);
router.get("/no-sale", repotsController.noSaleProducts);
router.get("/inventory-value", repotsController.getInventoryValue);
router.get(
  "/inventory-value-movements",
  repotsController.getInventoryValueFromMovements
);

module.exports = router;
