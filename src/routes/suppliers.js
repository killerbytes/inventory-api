const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/suppliers");

router.get("/list", supplierController.getAll);
router.get("/:id", supplierController.get);
router.get("/", supplierController.getPaginated);
router.post("/", supplierController.create);
router.patch("/:id", supplierController.update);
router.delete("/:id", supplierController.delete);

module.exports = router;
