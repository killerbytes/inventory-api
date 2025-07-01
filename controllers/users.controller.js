"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { PAGINATION } = require("../definitions");
const { userSchema, userBaseSchema } = require("../schema");
const { Op } = require("sequelize");
const users_service_1 = __importDefault(require("../services/users.service"));
const userController = {
    async get(req, res, next) {
        const { id } = req.params;
        try {
            const user = await users_service_1.default.get(id);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await users_service_1.default.create(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await users_service_1.default.getAll();
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const user = await users_service_1.default.update(id, req.body);
            return res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        const { id } = req.params;
        try {
            await users_service_1.default.delete(id);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    getPaginated: async (req, res, next) => {
        try {
            const result = await users_service_1.default.getPaginated(req.query);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = userController;
