const express = require("express");
const productsController = require("../controllers/products.controller");
const router = express.Router();

router.post("/:id/convertToUnit", productsController.cloneToUnit);
router.get("/all", productsController.getAllProducts);
router.get("/list", productsController.list);
router.get("/sku/:sku", productsController.getAllBySku);
router.get("/:id", productsController.get);
router.get("/", productsController.getPaginated);
router.post("/", productsController.create);
router.patch("/:id", productsController.update);
router.delete("/:id", productsController.delete);

module.exports = router;
