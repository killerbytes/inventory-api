"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categories_service_1 = __importDefault(require("../services/categories.service"));
const categoriesController = {
    get: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await categories_service_1.default.get(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await categories_service_1.default.create(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const result = await categories_service_1.default.getAll();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await categories_service_1.default.update(id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            console.log("catch", error);
            next(error);
        }
    },
    delete: async (req, res, next) => {
        const { id } = req.params;
        try {
            await categories_service_1.default.delete(id);
            res.status(204).json();
        }
        catch (error) {
            next(error);
        }
    },
    getPaginated: async (req, res, next) => {
        try {
            const result = await categories_service_1.default.getPaginated(req.query);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = categoriesController;
