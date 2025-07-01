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
const schema_1 = require("../schema");
const sequelize_1 = require("sequelize");
const definitions_js_1 = require("../definitions.js");
const ApiError_1 = __importDefault(require("./ApiError"));
const inventoryTransactions_service_1 = __importDefault(require("./inventoryTransactions.service"));
const definitions_js_2 = require("../definitions.js");
const { Inventory, Product } = models_1.default;
const inventoryService = {
    async get(id) {
        try {
            const inventories = await Inventory.findByPk(id, { raw: true });
            if (!inventories) {
                throw new Error("Inventory not found");
            }
            return inventories;
        }
        catch (error) {
            throw error;
        }
    },
    async create(payload) {
        const { error } = schema_1.inventorySchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { name, description } = payload;
            const result = await Inventory.create({
                name,
                description,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getAll() {
        const result = await Inventory.findAll({
            raw: true,
            nest: true,
            include: [{ model: Product, as: "product", attributes: ["name"] }],
        });
        return result;
    },
    async update(id, payload) {
        const { id: _id, product, updatedAt } = payload, params = __rest(payload, ["id", "product", "updatedAt"]);
        const { error } = schema_1.inventorySchema.validate(params, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const inventories = await Inventory.findByPk(id);
            if (!inventories) {
                throw new Error("Inventory not found");
            }
            await models_1.default.sequelize.transaction(async (transaction) => {
                try {
                    await inventoryTransactions_service_1.default.create({
                        inventoryId: inventories.id,
                        previousValue: inventories.price,
                        newValue: params.price,
                        value: params.price,
                        transactionType: definitions_js_2.INVENTORY_TRANSACTION_TYPE.ADJUSTMENT,
                    }, { transaction });
                }
                catch (error) {
                    console.log(error);
                    throw new Error("Error in createInventoryTransaction");
                }
                try {
                    await inventories.update(params, { transaction });
                }
                catch (error) {
                    throw new Error("Error in updateInventory");
                }
            });
            // await inventories.update(params);
            return inventories;
        }
        catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            const inventories = await Inventory.findByPk(id);
            if (!inventories) {
                throw new Error("Inventory not found");
            }
            await inventories.destroy();
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
                        { "$product.name$": { [sequelize_1.Op.like]: `%${q}%` } },
                        { "$product.description$": { [sequelize_1.Op.like]: `%${q}%` } },
                    ],
                }
                : null;
            const offset = (page - 1) * limit;
            const order = [];
            if (sort) {
                switch (sort) {
                    case "product.name":
                        order.push(["product", "name", query.order || "ASC"]);
                        break;
                    case "product.description":
                        order.push(["product", "description", query.order || "ASC"]);
                        break;
                    case "product.reorderLevel":
                        order.push(["product", "reorderLevel", query.order || "ASC"]);
                        break;
                    default:
                        order.push([sort, query.order || "ASC"]);
                        break;
                }
            }
            else {
                order.push(["product", "name", "ASC"]); // Default sort
            }
            const { count, rows } = await Inventory.findAndCountAll({
                limit,
                offset,
                order,
                where,
                raw: true,
                nest: true,
                include: [{ model: Product, as: "product" }],
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
exports.default = inventoryService;
