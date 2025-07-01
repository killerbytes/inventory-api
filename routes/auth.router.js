"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const verifyToken_1 = require("../middlewares/verifyToken");
const router = express_1.default.Router();
router.get("/me", verifyToken_1.verifyToken, auth_controller_1.default.me);
router.post("/login", auth_controller_1.default.login);
exports.default = router;
