"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../models"));
const inventory_service_1 = __importDefault(require("../services/inventory.service"));
const { Inventory, Product } = models_1.default;
const inventoryController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const inventories = await inventory_service_1.default.get(id);
            return res.status(200).json(inventories);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const { name, description } = req.body;
            const result = await inventory_service_1.default.create({
                name,
                description,
            });
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await inventory_service_1.default.getAll();
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json(error);
        }
    },
    async update(req, res, next) {
        const { id } = req.params;
        try {
            const inventories = await inventory_service_1.default.update(id, req.body);
            return res.status(200).json(inventories);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await inventory_service_1.default.delete(id);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async getPaginated(req, res, next) {
        try {
            const result = await inventory_service_1.default.getPaginated(req.query);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getReorderList(req, res, next) {
        try {
            const inventories = await Inventory.findAll({
                raw: true,
                nest: true,
            });
            return res.status(200).json(inventories);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = inventoryController;
