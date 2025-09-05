const express = require("express");
const invoiceController = require("../controllers/invoice.controller");
const router = express.Router();

router.get("/:id", invoiceController.get);
router.get("/", invoiceController.getPaginated);
router.post("/", invoiceController.create);
router.patch("/:id", invoiceController.update);
router.delete("/:id", invoiceController.delete);

module.exports = router;
