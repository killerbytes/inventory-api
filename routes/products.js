const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");

router.get("/list", productsController.getAll);
router.get("/:id", productsController.get);
router.get("/", productsController.getPaginated);
router.post("/", productsController.create);
router.patch("/:id", productsController.update);
router.delete("/:id", productsController.delete);

module.exports = router;
