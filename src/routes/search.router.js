const express = require("express");
const productCombinationController = require("../controllers/productCombination.controller");
const router = express.Router();

router.get("/products", productCombinationController.search);

module.exports = router;
