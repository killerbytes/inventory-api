const express = require("express");
const repotsController = require("../controllers/reports.controller");
const router = express.Router();

router.get("/popular", repotsController.getPopularProducts);
router.get("/profit", repotsController.getProfitProducts);
router.get("/no-sale", repotsController.noSaleProducts);

module.exports = router;
