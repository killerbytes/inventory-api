const express = require("express");
const supplierController = require("../controllers/supplier.controller");
const router = express.Router();

router.get("/byProductId/:id", supplierController.getByProductId);
router.get("/list", supplierController.list);
router.get("/:id", supplierController.get);
router.get("/", supplierController.getPaginated);
router.post("/", supplierController.create);
router.patch("/:id", supplierController.update);
router.delete("/:id", supplierController.delete);

module.exports = router;
