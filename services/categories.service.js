"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const definitions_js_1 = require("../definitions.js");
const models_1 = __importDefault(require("../models"));
const schema_1 = require("../schema");
const ApiError_1 = __importDefault(require("./ApiError"));
const { Category } = models_1.default;
const categoryServices = {
    get: async (id) => {
        try {
            const category = await Category.findByPk(id, { raw: true });
            if (!category) {
                throw new Error("Categories not found");
            }
            return category;
        }
        catch (error) {
            throw error;
        }
    },
    create: async (payload) => {
        const { error } = schema_1.categorySchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { name, description } = payload;
            const result = await Category.create({
                name,
                description,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    getAll: async () => {
        const result = await Category.findAll({
            raw: true,
            order: [["name", "ASC"]],
        });
        return result;
    },
    update: async (id, payload) => {
        const { id: _id } = payload, params = __rest(payload, ["id"]);
        const { error } = schema_1.categorySchema.validate(params, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                throw new Error("Categories not found");
            }
            return category.update(params);
        }
        catch (error) {
            throw error;
        }
    },
    delete: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error("Categories not found");
        }
        return category.destroy();
    },
    async getPaginated(query) {
        const { q = null, sort } = query;
        const limit = parseInt(query.limit) || definitions_js_1.PAGINATION.LIMIT;
        const page = parseInt(query.page) || definitions_js_1.PAGINATION.PAGE;
        try {
            const where = q
                ? {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: `%${q}%` } },
                        { description: { [sequelize_1.Op.like]: `%${q}%` } },
                    ],
                }
                : null;
            const offset = (page - 1) * limit;
            const order = [];
            if (sort) {
                switch (sort) {
                    case "category.name":
                        order.push(["category", "name", query.order || "ASC"]);
                        break;
                    default:
                        order.push([sort, query.order || "ASC"]);
                        break;
                }
            }
            else {
                order.push(["name", "ASC"]); // Default sort
            }
            const { count, rows } = await Category.findAndCountAll({
                limit,
                offset,
                order,
                where,
                raw: true,
                nest: true,
            });
            return {
                data: rows,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
        }
        catch (error) {
            throw error;
        }
    },
};
exports.default = categoryServices;
