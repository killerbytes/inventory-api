"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("./ApiError"));
const models_1 = __importDefault(require("../models"));
const schema_1 = require("../schema");
const definitions_js_1 = require("../definitions.js");
const sequelize_1 = require("sequelize");
const schema_2 = require("../schema");
const auth_service_1 = __importDefault(require("./auth.service"));
const { PurchaseOrder, PurchaseOrderItem, Product } = models_1.default;
const purchaseOrderService = {
    async get(id) {
        try {
            const purchaseOrder = await PurchaseOrder.findByPk(id, {
                include: [
                    {
                        model: PurchaseOrderItem,
                        as: "purchaseOrderItems",
                        where: { orderId: id },
                        attributes: { exclude: ["createdAt", "updatedAt"] },
                        include: [
                            {
                                model: Product,
                                as: "product",
                                include: [
                                    { model: models_1.default.Category, as: "category", attributes: ["name"] },
                                ],
                                attributes: { exclude: ["createdAt", "updatedAt"] },
                            },
                        ],
                    },
                    {
                        model: models_1.default.Supplier,
                        as: "supplier",
                    },
                    {
                        model: models_1.default.User,
                        as: "orderByUser",
                    },
                    {
                        model: models_1.default.User,
                        as: "receivedByUser",
                    },
                    {
                        model: models_1.default.User,
                        as: "completedByUser",
                    },
                    {
                        model: models_1.default.User,
                        as: "cancelledByUser",
                    },
                ],
                // raw: true,
                nest: true,
            });
            if (!purchaseOrder) {
                throw new Error("PurchaseOrder not found");
            }
            return purchaseOrder;
        }
        catch (error) {
            throw error;
        }
    },
    async create(payload, user) {
        const { error } = schema_1.purchaseOrderSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { supplierId, orderDate, status, deliveryDate, receivedDate, notes, purchaseOrderItems, isCheckPayment, dueDate, } = payload;
            const totalAmount = purchaseOrderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
            const result = await PurchaseOrder.create({
                supplierId,
                orderDate,
                status,
                deliveryDate,
                receivedDate,
                totalAmount,
                orderBy: user.id,
                notes,
                purchaseOrderItems,
                isCheckPayment,
                dueDate,
            }, {
                include: [
                    {
                        model: PurchaseOrderItem,
                        as: "purchaseOrderItems",
                    },
                ],
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getAll() {
        const result = await PurchaseOrder.findAll({
            include: [
                {
                    model: PurchaseOrderItem,
                    as: "purchaseOrderItems",
                    include: [
                        {
                            model: Product,
                            as: "product",
                        },
                    ],
                },
            ],
            raw: true,
            nest: true,
        });
        return result;
    },
    // async update(id, payload) {
    //   const { id: _id, ...params } = payload;
    //   const { error } = purchaseOrderSchema.validate(params, {
    //     abortEarly: false,
    //   });
    //   if (error) {
    //     throw ApiError.validation(error);
    //   }
    //   try {
    //     const purchaseOrder = await PurchaseOrder.findByPk(id);
    //     if (!purchaseOrder) {
    //       throw new Error("PurchaseOrder not found");
    //     }
    //     await purchaseOrder.update(params);
    //     return purchaseOrder;
    //   } catch (error) {
    //     throw error;
    //   }
    // },
    async delete(id) {
        try {
            const purchaseOrder = await PurchaseOrder.findByPk(id);
            if (!purchaseOrder) {
                throw new Error("PurchaseOrder not found");
            }
            await purchaseOrder.destroy();
        }
        catch (error) {
            throw error;
        }
    },
    async getPaginated(params) {
        const { limit = definitions_js_1.PAGINATION.LIMIT, page = definitions_js_1.PAGINATION, q, startDate, endDate, status, sort, } = params;
        const where = {};
        // Build the where clause
        // Search by name if query exists
        if (q) {
            where.name = { [sequelize_1.Op.like]: `%${q}%` };
        }
        if (status) {
            where.status = status;
        }
        // Add date filtering if dates are provided
        if (startDate || endDate) {
            where.updatedAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.updatedAt[sequelize_1.Op.gte] = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.updatedAt[sequelize_1.Op.lte] = end;
            }
        }
        const offset = (page - 1) * limit;
        try {
            const order = [];
            if (sort) {
                order.push([sort, order || "ASC"]);
            }
            const { count, rows } = await PurchaseOrder.findAndCountAll({
                limit,
                offset,
                order,
                where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
                nest: true,
                include: [
                    {
                        model: models_1.default.PurchaseOrderItem,
                        as: "purchaseOrderItems",
                        include: [
                            {
                                model: models_1.default.Product,
                                as: "product",
                                include: [
                                    {
                                        model: models_1.default.Category,
                                        as: "category",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: models_1.default.User,
                        as: "receivedByUser",
                    },
                    {
                        model: models_1.default.User,
                        as: "orderByUser",
                    },
                    {
                        model: models_1.default.Supplier,
                        as: "supplier",
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
    async updateStatus(id, payload, user) {
        const { error } = schema_2.purchaseOrderStatusSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const purchaseOrder = await PurchaseOrder.findByPk(id, {
                include: [
                    {
                        model: PurchaseOrderItem,
                        as: "purchaseOrderItems",
                    },
                ],
            });
            if (!purchaseOrder) {
                throw new Error("PurchaseOrder not found");
            }
            switch (purchaseOrder.status) {
                case definitions_js_1.PURCHASE_ORDER_STATUS.PENDING: // Pending to Received
                    await models_1.default.sequelize.transaction(async (transaction) => {
                        try {
                            await purchaseOrder.update({
                                status: definitions_js_1.PURCHASE_ORDER_STATUS.RECEIVED,
                                receivedBy: user.id,
                                receivedDate: new Date(),
                            }, { transaction });
                        }
                        catch (error) {
                            throw new Error("Error in updatePurchaseOrder");
                        }
                        try {
                            await processInventoryUpdates(purchaseOrder, transaction);
                        }
                        catch (error) {
                            throw new Error("Error in processInventoryUpdates");
                        }
                    });
                    break;
                case definitions_js_1.PURCHASE_ORDER_STATUS.RECEIVED: // Received to Completed
                    await models_1.default.sequelize.transaction(async (transaction) => {
                        try {
                            await purchaseOrder.update({
                                status: definitions_js_1.PURCHASE_ORDER_STATUS.COMPLETED,
                                isCheckPaymentPaid: true,
                                completedBy: user.id,
                                completedDate: new Date(),
                            }, { transaction });
                        }
                        catch (error) {
                            console.log(error);
                            throw new Error("Error in updatePurchaseOrder");
                        }
                    });
                    break;
                case definitions_js_1.PURCHASE_ORDER_STATUS.COMPLETED: // Completed to Cancelled
                    await models_1.default.sequelize.transaction(async (transaction) => {
                        try {
                            const { cancellationReason } = payload;
                            await purchaseOrder.update({
                                cancellationReason,
                                status: definitions_js_1.PURCHASE_ORDER_STATUS.CANCELLED,
                                cancelledBy: user.id,
                                cancelledDate: new Date(),
                            }, { transaction });
                        }
                        catch (error) {
                            console.log(error);
                            throw new Error("Error in updatePurchaseOrder");
                        }
                        try {
                            await processInventoryUpdates(purchaseOrder, transaction);
                        }
                        catch (error) {
                            throw new Error("Error in processInventoryUpdates");
                        }
                    });
                default:
            }
            return purchaseOrder;
        }
        catch (error) {
            throw error;
        }
    },
};
const processInventoryUpdates = async (purchaseOrder, transaction) => {
    const { status, purchaseOrderItems, id } = purchaseOrder;
    const user = await auth_service_1.default.getCurrent();
    if (status === definitions_js_1.PURCHASE_ORDER_STATUS.RECEIVED) {
        await handleCompletedOrder(purchaseOrder.sequelize, purchaseOrderItems, id, user.id, transaction);
    }
    else if (status === definitions_js_1.PURCHASE_ORDER_STATUS.CANCELLED) {
        await handleCancelledOrder(purchaseOrder.sequelize, purchaseOrderItems, id, user.id, transaction);
    }
};
const handleCompletedOrder = async (sequelize, items, orderId, userId, transaction) => {
    await Promise.all(items.map(async (item) => {
        const [inventory] = await sequelize.models.Inventory.findOrCreate({
            where: { productId: item.productId },
            defaults: { productId: item.productId, quantity: 0 },
            transaction,
        });
        await sequelize.models.InventoryTransaction.create({
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: parseInt(inventory.quantity) + parseInt(item.quantity),
            value: item.quantity,
            transactionType: definitions_js_1.INVENTORY_TRANSACTION_TYPE.PURCHASE,
            orderId,
            orderType: definitions_js_1.ORDER_TYPE.PURCHASE,
            userId,
        }, { transaction });
        await inventory.update({ quantity: inventory.quantity + item.quantity }, { transaction });
    }));
};
const handleCancelledOrder = async (sequelize, items, orderId, userId, transaction) => {
    await Promise.all(items.map(async (item) => {
        const [inventory] = await sequelize.models.Inventory.findOrCreate({
            where: { productId: item.productId },
            defaults: { productId: item.productId, quantity: 0 },
            transaction,
        });
        await sequelize.models.InventoryTransaction.create({
            inventoryId: inventory.id,
            previousValue: inventory.quantity,
            newValue: parseInt(inventory.quantity) - parseInt(item.quantity),
            value: item.quantity,
            transactionType: definitions_js_1.INVENTORY_TRANSACTION_TYPE.CANCELLATION,
            orderId,
            orderType: definitions_js_1.ORDER_TYPE.PURCHASE,
            userId,
        }, { transaction });
        await inventory.update({ quantity: inventory.quantity - item.quantity }, { transaction });
    }));
};
exports.default = purchaseOrderService;
