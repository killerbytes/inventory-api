"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const products_service_1 = __importDefault(require("../services/products.service"));
const models_1 = __importDefault(require("../models"));
const { Category } = models_1.default;
const productController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const product = await products_service_1.default.get(id);
            return res.status(200).json(product);
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const result = await products_service_1.default.create(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await products_service_1.default.getAll();
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        const { id } = req.params;
        try {
            const product = await products_service_1.default.update(id, req.body);
            return res.status(200).json(product);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await products_service_1.default.delete(id);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    async getPaginated(req, res, next) {
        const query = req.query;
        try {
            const result = await products_service_1.default.getPaginated(query);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    // async getLowInventoryProducts(req, res, next) {
    //   try {
    //     const result = await ProductService.getLowInventoryProducts();
    //     return res.status(200).json(result);
    //   } catch (error) {
    //     return res.status(500).json(formatErrors(error));
    //   }
    // },
};
exports.default = productController;
