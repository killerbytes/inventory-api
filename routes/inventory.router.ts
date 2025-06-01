import express from "express";
import inventoryController from "../controllers/inventory.controller";
import inventoryTransactionsController from "../controllers/inventoryTransactions.controller";
const router = express.Router();

router.get("/", inventoryController.getPaginated);
router.post("/", inventoryController.create);
router.get("/reorders", inventoryController.getReorderList);
router.get("/list", inventoryController.getAll);
router.get("/transactions", inventoryTransactionsController.getPaginated);
router.get("/:id", inventoryController.get);
router.patch("/:id", inventoryController.update);
router.delete("/:id", inventoryController.delete);

export default router;
