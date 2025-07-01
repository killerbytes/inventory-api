"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventory_controller_1 = __importDefault(require("../controllers/inventory.controller"));
const inventoryTransactions_controller_1 = __importDefault(require("../controllers/inventoryTransactions.controller"));
const router = express_1.default.Router();
router.get("/", inventory_controller_1.default.getPaginated);
router.post("/", inventory_controller_1.default.create);
router.get("/reorders", inventory_controller_1.default.getReorderList);
router.get("/list", inventory_controller_1.default.getAll);
router.get("/transactions", inventoryTransactions_controller_1.default.getPaginated);
router.get("/:id", inventory_controller_1.default.get);
router.patch("/:id", inventory_controller_1.default.update);
router.delete("/:id", inventory_controller_1.default.delete);
exports.default = router;
