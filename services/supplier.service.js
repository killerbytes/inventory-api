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
const ApiError_1 = __importDefault(require("./ApiError"));
const schema_1 = require("../schema");
const sequelize_1 = require("sequelize");
const definitions_js_1 = require("../definitions.js");
const { Supplier } = models_1.default;
const supplierService = {
    async get(id) {
        try {
            const supplier = await Supplier.findByPk(id, { raw: true });
            if (!supplier) {
                throw new Error("Supplier not found");
            }
            return supplier;
        }
        catch (error) {
            throw error;
        }
    },
    async create(payload) {
        const { error } = schema_1.supplierSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { name, contact, email, phone, address } = payload;
            const result = await Supplier.create({
                name,
                contact,
                email,
                phone,
                address,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getAll() {
        const result = await Supplier.findAll({
            raw: true,
            order: [["name", "ASC"]],
        });
        return result;
    },
    async update(id, payload) {
        const { id: _id } = payload, params = __rest(payload, ["id"]);
        const { error } = schema_1.supplierSchema.validate(params, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const supplier = await Supplier.findByPk(id);
            if (!supplier) {
                throw new Error("Supplier not found");
            }
            await supplier.update(params);
            return supplier;
        }
        catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            const supplier = await Supplier.findByPk(id);
            if (!supplier) {
                throw new Error("Supplier not found");
            }
            return await supplier.destroy();
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
            const where = q
                ? {
                    [sequelize_1.Op.or]: [
                        { address: { [sequelize_1.Op.like]: `%${q}%` } },
                        { contact: { [sequelize_1.Op.like]: `%${q}%` } },
                        { email: { [sequelize_1.Op.like]: `%${q}%` } },
                        { name: { [sequelize_1.Op.like]: `%${q}%` } },
                        { phone: { [sequelize_1.Op.like]: `%${q}%` } },
                        { notes: { [sequelize_1.Op.like]: `%${q}%` } },
                    ],
                }
                : null;
            const offset = (page - 1) * limit;
            const order = [];
            if (sort) {
                switch (sort) {
                    default:
                        order.push([sort, query.order || "ASC"]);
                        break;
                }
            }
            else {
                order.push(["name", "ASC"]); // Default sort
            }
            const { count, rows } = await Supplier.findAndCountAll({
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
exports.default = supplierService;
