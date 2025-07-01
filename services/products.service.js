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
const models_1 = __importDefault(require("../models"));
const { Product, Category } = models_1.default;
const ApiError_1 = __importDefault(require("./ApiError"));
const schema_1 = require("../schema");
const definitions_js_1 = require("../definitions.js");
const sequelize_1 = require("sequelize");
const productService = {
    async get(id) {
        try {
            const product = await Product.findByPk(id, {
                include: [{ model: Category, as: "category" }],
                raw: true,
            });
            if (!product) {
                throw new Error("Product not found");
            }
            return product;
        }
        catch (error) {
            throw error;
        }
    },
    async create(payload) {
        const { error } = schema_1.productSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { name, description, categoryId, reorderLevel } = payload;
            const result = await Product.create({
                name,
                description,
                categoryId,
                reorderLevel,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getAll() {
        try {
            const result = await Product.findAll({
                include: [{ model: Category, as: "category", attributes: ["name"] }],
                order: [["name", "ASC"]],
                raw: true,
                nest: true,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async update(id, payload) {
        const { id: _id } = payload, params = __rest(payload, ["id"]);
        const { error } = schema_1.productSchema.validate(params, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error("Product not found");
            }
            await product.update(params);
            return product;
        }
        catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error("Product not found");
            }
            await product.destroy();
        }
        catch (error) {
            throw error;
        }
    },
    async getPaginated(query) {
        const { q = null, sort } = query;
        const limit = parseInt(query.limit) || definitions_js_1.PAGINATION.LIMIT;
        const page = parseInt(query.page) || definitions_js_1.PAGINATION.PAGE;
        try {
            const where = q ? { name: { [sequelize_1.Op.like]: `%${q}%` } } : null;
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
            const { count, rows } = await Product.findAndCountAll({
                limit,
                offset,
                order,
                where,
                raw: true,
                nest: true,
                include: [{ model: Category, as: "category", attributes: ["name"] }],
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
exports.default = productService;
