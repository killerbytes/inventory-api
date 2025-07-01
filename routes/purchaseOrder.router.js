"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const purchaseOrder_controller_1 = __importDefault(require("../controllers/purchaseOrder.controller"));
const router = express_1.default.Router();
router.get("/list", purchaseOrder_controller_1.default.getAll);
router.get("/:id", purchaseOrder_controller_1.default.get);
router.get("/", purchaseOrder_controller_1.default.getPaginated);
router.post("/", purchaseOrder_controller_1.default.create);
// router.patch("/:id", purchaseOrderController.update);
router.delete("/:id", purchaseOrder_controller_1.default.delete);
router.patch("/:id/status", purchaseOrder_controller_1.default.updateStatus);
exports.default = router;
