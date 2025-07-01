"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const salesOrder_service_1 = __importDefault(require("../services/salesOrder.service"));
const auth_service_1 = __importDefault(require("../services/auth.service"));
const salesOrderController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const salesOrder = await salesOrder_service_1.default.get(id);
            res.status(200).json(salesOrder);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const user = await auth_service_1.default.getCurrent();
            const result = await salesOrder_service_1.default.create(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await salesOrder_service_1.default.getAll();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        const { id } = req.params;
        try {
            const salesOrder = await salesOrder_service_1.default.update(id, req.body);
            await salesOrder.update(req.body);
            res.status(200).json(salesOrder);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await salesOrder_service_1.default.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async getPaginated(req, res, next) {
        try {
            const result = await salesOrder_service_1.default.getPaginated(req.query);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        const { id } = req.params;
        const user = await auth_service_1.default.getCurrent();
        try {
            const salesOrder = await salesOrder_service_1.default.updateStatus(id, req.body, user);
            res.status(200).json(salesOrder);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = salesOrderController;
