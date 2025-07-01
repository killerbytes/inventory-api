"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = __importDefault(require("../controllers/users.controller"));
const router = express_1.default.Router();
router.get("/list", users_controller_1.default.getAll);
router.get("/:id", users_controller_1.default.get);
router.get("/", users_controller_1.default.getPaginated);
router.post("/", users_controller_1.default.create);
router.patch("/:id", users_controller_1.default.update);
router.delete("/:id", users_controller_1.default.delete);
exports.default = router;
