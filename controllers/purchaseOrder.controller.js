"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchaseOrders_service_1 = __importDefault(require("../services/purchaseOrders.service"));
const auth_service_1 = __importDefault(require("../services/auth.service"));
const purchaseOrderController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const purchaseOrder = await purchaseOrders_service_1.default.get(id);
            res.status(200).json(purchaseOrder);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        const user = await auth_service_1.default.getCurrent();
        try {
            const result = await purchaseOrders_service_1.default.create(req.body, user);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await purchaseOrders_service_1.default.getAll();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    // async update(req, res, next) {
    //   const { id } = req.params;
    //   try {
    //     const purchaseOrder = await purchaseOrderService.update(id, req.body);
    //     res.status(200).json(purchaseOrder);
    //   } catch (error) {
    //     next(error);
    //   }
    // },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await purchaseOrders_service_1.default.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async getPaginated(req, res, next) {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const q = req.query.q || null;
        const { startDate, endDate, status } = req.query;
        const where = {};
        try {
            const order = [];
            if (req.query.sort) {
                order.push([
                    req.query.sort,
                    req.query.order || "ASC",
                ]);
            }
            const result = await purchaseOrders_service_1.default.getPaginated({
                limit,
                page,
                q,
                startDate,
                endDate,
                status,
            });
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
            const purchaseOrder = await purchaseOrders_service_1.default.updateStatus(id, req.body, user);
            res.status(200).json(purchaseOrder);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = purchaseOrderController;
