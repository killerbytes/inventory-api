"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const definitions_js_1 = require("../definitions.js");
const models_1 = __importDefault(require("../models"));
const ApiError_1 = __importDefault(require("./ApiError"));
const schema_js_1 = require("../schema.js");
const auth_service_1 = __importDefault(require("./auth.service"));
const { Inventory, InventoryTransaction, Product } = models_1.default;
const inventoryTransactionService = {
    async create(payload, transaction) {
        const { error } = schema_js_1.inventoryTransactionSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { inventoryId, previousValue, newValue, value, transactionType } = payload;
            const user = await auth_service_1.default.getCurrent();
            console.log("user", user);
            const result = await InventoryTransaction.create({
                inventoryId,
                previousValue,
                newValue,
                value,
                transactionType,
                orderId: null,
                orderType: null,
                userId: user.id,
            }, Object.assign({}, transaction));
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getPaginated(query) {
        const { q = null, transactionType = null } = query;
        const limit = parseInt(query.limit) || definitions_js_1.PAGINATION.LIMIT;
        const page = parseInt(query.page) || definitions_js_1.PAGINATION.PAGE;
        try {
            const where = {
                [sequelize_1.Op.and]: [
                    ...(q
                        ? [{ "$inventory.product.name$": { [sequelize_1.Op.like]: `%${q}%` } }]
                        : []),
                    ...(transactionType
                        ? [{ transactionType: { [sequelize_1.Op.like]: `%${transactionType}%` } }]
                        : []),
                ],
            };
            // { "$product.name$": { [Op.like]: `%${q}%` } },
            // const where = transactionType
            //   ? { transactionType: { [Op.like]: `%${transactionType}%` } }
            //   : null;
            const offset = (page - 1) * limit;
            const order = [];
            console.log(123, where);
            const { count, rows } = await InventoryTransaction.findAndCountAll({
                limit,
                offset,
                order,
                where,
                raw: true,
                nest: true,
                include: [
                    {
                        model: Inventory,
                        as: "inventory",
                        include: [{ model: Product, as: "product" }],
                    },
                ],
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
exports.default = inventoryTransactionService;
