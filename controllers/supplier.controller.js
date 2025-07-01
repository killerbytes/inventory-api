"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supplier_service_1 = __importDefault(require("../services/supplier.service"));
const supplierController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const supplier = await supplier_service_1.default.get(id);
            return res.status(200).json(supplier);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const { name, contact, email, phone, address } = req.body;
            const result = await supplier_service_1.default.create({
                name,
                contact,
                email,
                phone,
                address,
            });
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await supplier_service_1.default.getAll();
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        const { id } = req.params;
        try {
            const supplier = await supplier_service_1.default.update(id, req.body);
            return res.status(200).json(supplier);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await supplier_service_1.default.delete(id);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async getPaginated(req, res, next) {
        try {
            const result = await supplier_service_1.default.getPaginated(req.query);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = supplierController;
