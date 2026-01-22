const express = require("express");
const repotsController = require("../controllers/reports.controller");
const router = express.Router();

router.get("/top-selling", repotsController.getTopSellingProducts);

module.exports = router;
