"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_controller_1 = __importDefault(require("../controllers/products.controller"));
const router = express_1.default.Router();
router.get("/list", products_controller_1.default.getAll);
router.get("/:id", products_controller_1.default.get);
router.get("/", products_controller_1.default.getPaginated);
router.post("/", products_controller_1.default.create);
router.patch("/:id", products_controller_1.default.update);
router.delete("/:id", products_controller_1.default.delete);
exports.default = router;
