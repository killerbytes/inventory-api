"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inventoryTransactions_service_1 = __importDefault(require("../services/inventoryTransactions.service"));
const inventoryTransactionController = {
    async getPaginated(req, res, next) {
        try {
            const result = await inventoryTransactions_service_1.default.getPaginated(req.query);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = inventoryTransactionController;
