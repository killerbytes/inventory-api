const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory"); // Correct import path
const inventoryTransactionsController = require("../controllers/inventoryTransactions");

router.get("/", inventoryController.getPaginated);
router.post("/", inventoryController.create);
router.get("/reorders", inventoryController.getReorderList);
router.get("/list", inventoryController.getAll);
router.get("/transactions", inventoryTransactionsController.getPaginated);
router.get("/:id", inventoryController.get);
router.patch("/:id", inventoryController.update);
router.delete("/:id", inventoryController.delete);

module.exports = router;
