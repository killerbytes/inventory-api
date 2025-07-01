"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supplier_controller_1 = __importDefault(require("../controllers/supplier.controller"));
const router = express_1.default.Router();
router.get("/list", supplier_controller_1.default.getAll);
router.get("/:id", supplier_controller_1.default.get);
router.get("/", supplier_controller_1.default.getPaginated);
router.post("/", supplier_controller_1.default.create);
router.patch("/:id", supplier_controller_1.default.update);
router.delete("/:id", supplier_controller_1.default.delete);
exports.default = router;
