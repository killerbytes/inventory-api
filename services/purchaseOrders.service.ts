import { Transaction } from "sequelize";
import ApiError from "./ApiError";
import db from "../models";
import { purchaseOrderSchema } from "../schema";
import {
  INVENTORY_TRANSACTION_TYPE,
  ORDER_TYPE,
  PURCHASE_ORDER_STATUS,
  PAGINATION,
} from "../definitions.js";
import { Op } from "sequelize";
import { purchaseOrderStatusSchema } from "../schema";
import authService from "./auth.service";
const { PurchaseOrder, PurchaseOrderItem, Product } = db;

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
                  { model: db.Category, as: "category", attributes: ["name"] },
                ],
                attributes: { exclude: ["createdAt", "updatedAt"] },
              },
            ],
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
          {
            model: db.User,
            as: "orderByUser",
          },
          {
            model: db.User,
            as: "receivedByUser",
          },
          {
            model: db.User,
            as: "completedByUser",
          },
          {
            model: db.User,
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
    } catch (error) {
      throw error;
    }
  },
  async create(payload, user) {
    const { error } = purchaseOrderSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }

    try {
      const {
        supplierId,
        orderDate,
        status,
        deliveryDate,
        receivedDate,
        notes,
        purchaseOrderItems,
        isCheckPayment,
        dueDate,
      } = payload;

      const totalAmount = purchaseOrderItems.reduce(
        (total: number, item: any) => total + item.unitPrice * item.quantity,
        0
      );

      const result = await PurchaseOrder.create(
        {
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
        },
        {
          include: [
            {
              model: PurchaseOrderItem,
              as: "purchaseOrderItems",
            },
          ],
        }
      );

      return result;
    } catch (error) {
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
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(params) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION,
      q,
      startDate,
      endDate,
      status,
      sort,
    } = params;
    const where: any = {};

    // Build the where clause

    // Search by name if query exists
    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    // Add date filtering if dates are provided
    if (startDate || endDate) {
      where.updatedAt = {};

      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.updatedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.updatedAt[Op.lte] = end;
      }
    }

    const offset = (page - 1) * limit;

    try {
      const order = [];
      if (sort) {
        order.push([sort as string, order || "ASC"]);
      }

      const { count, rows } = await PurchaseOrder.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        include: [
          {
            model: db.PurchaseOrderItem,
            as: "purchaseOrderItems",
            include: [
              {
                model: db.Product,
                as: "product",
                include: [
                  {
                    model: db.Category,
                    as: "category",
                  },
                ],
              },
            ],
          },
          {
            model: db.User,
            as: "receivedByUser",
          },
          {
            model: db.User,
            as: "orderByUser",
          },
          {
            model: db.Supplier,
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
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id, payload, user) {
    const { error } = purchaseOrderStatusSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
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
        case PURCHASE_ORDER_STATUS.PENDING: // Pending to Received
          await db.sequelize.transaction(async (transaction: Transaction) => {
            try {
              await purchaseOrder.update(
                {
                  status: PURCHASE_ORDER_STATUS.RECEIVED,
                  receivedBy: user.id,
                  receivedDate: new Date(),
                },
                { transaction }
              );
            } catch (error) {
              throw new Error("Error in updatePurchaseOrder");
            }
            try {
              await processInventoryUpdates(purchaseOrder, transaction);
            } catch (error) {
              throw new Error("Error in processInventoryUpdates");
            }
          });

          break;
        case PURCHASE_ORDER_STATUS.RECEIVED: // Received to Completed
          await db.sequelize.transaction(async (transaction: Transaction) => {
            try {
              await purchaseOrder.update(
                {
                  status: PURCHASE_ORDER_STATUS.COMPLETED,
                  isCheckPaymentPaid: true,
                  completedBy: user.id,
                  completedDate: new Date(),
                },
                { transaction }
              );
            } catch (error) {
              console.log(error);

              throw new Error("Error in updatePurchaseOrder");
            }
          });
          break;
        case PURCHASE_ORDER_STATUS.COMPLETED: // Completed to Cancelled
          await db.sequelize.transaction(async (transaction: Transaction) => {
            try {
              const { cancellationReason } = payload;
              await purchaseOrder.update(
                {
                  cancellationReason,
                  status: PURCHASE_ORDER_STATUS.CANCELLED,
                  cancelledBy: user.id,
                  cancelledDate: new Date(),
                },
                { transaction }
              );
            } catch (error) {
              console.log(error);

              throw new Error("Error in updatePurchaseOrder");
            }
            try {
              await processInventoryUpdates(purchaseOrder, transaction);
            } catch (error) {
              throw new Error("Error in processInventoryUpdates");
            }
          });
        default:
      }

      return purchaseOrder;
    } catch (error: any) {
      throw error;
    }
  },
};

const processInventoryUpdates = async (purchaseOrder, transaction) => {
  const { status, purchaseOrderItems, id } = purchaseOrder;
  const user = await authService.getCurrent();
  if (status === PURCHASE_ORDER_STATUS.RECEIVED) {
    await handleCompletedOrder(
      purchaseOrder.sequelize,
      purchaseOrderItems,
      id,
      user.id,
      transaction
    );
  } else if (status === PURCHASE_ORDER_STATUS.CANCELLED) {
    await handleCancelledOrder(
      purchaseOrder.sequelize,
      purchaseOrderItems,
      id,
      user.id,
      transaction
    );
  }
};

const handleCompletedOrder = async (
  sequelize,
  items,
  orderId,
  userId,
  transaction
) => {
  await Promise.all(
    items.map(async (item) => {
      const [inventory] = await sequelize.models.Inventory.findOrCreate({
        where: { productId: item.productId },
        defaults: { productId: item.productId, quantity: 0 },
        transaction,
      });

      await sequelize.models.InventoryTransaction.create(
        {
          inventoryId: inventory.id,
          previousValue: inventory.quantity,
          newValue: parseInt(inventory.quantity) + parseInt(item.quantity),
          value: item.quantity,
          transactionType: INVENTORY_TRANSACTION_TYPE.PURCHASE,
          orderId,
          orderType: ORDER_TYPE.PURCHASE,
          userId,
        },
        { transaction }
      );

      await inventory.update(
        { quantity: inventory.quantity + item.quantity },
        { transaction }
      );
    })
  );
};

const handleCancelledOrder = async (
  sequelize,
  items,
  orderId,
  userId,
  transaction
) => {
  await Promise.all(
    items.map(async (item) => {
      const [inventory] = await sequelize.models.Inventory.findOrCreate({
        where: { productId: item.productId },
        defaults: { productId: item.productId, quantity: 0 },
        transaction,
      });

      await sequelize.models.InventoryTransaction.create(
        {
          inventoryId: inventory.id,
          previousValue: inventory.quantity,
          newValue: parseInt(inventory.quantity) - parseInt(item.quantity),
          value: item.quantity,
          transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
          orderId,
          orderType: ORDER_TYPE.PURCHASE,
          userId,
        },
        { transaction }
      );

      await inventory.update(
        { quantity: inventory.quantity - item.quantity },
        { transaction }
      );
    })
  );
};

export default purchaseOrderService;
