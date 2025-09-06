const express = require("express");
const paymentController = require("../controllers/payment.controller");
const router = express.Router();

router.get("/:id", paymentController.get);
router.post("/", paymentController.create);

module.exports = router;
