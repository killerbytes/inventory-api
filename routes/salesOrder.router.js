"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesOrders_controller_1 = __importDefault(require("../controllers/salesOrders.controller"));
const router = express_1.default.Router();
router.get("/list", salesOrders_controller_1.default.getAll);
router.get("/:id", salesOrders_controller_1.default.get);
router.get("/", salesOrders_controller_1.default.getPaginated);
router.post("/", salesOrders_controller_1.default.create);
router.patch("/:id", salesOrders_controller_1.default.update);
router.delete("/:id", salesOrders_controller_1.default.delete);
router.patch("/:id/status", salesOrders_controller_1.default.updateStatus);
exports.default = router;
