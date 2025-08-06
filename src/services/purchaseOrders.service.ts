import { Transaction, Op } from "sequelize";
import db, { sequelize } from "../models";
import { purchaseOrderSchema } from "../schemas";
import {
  INVENTORY_MOVEMENT_TYPE,
  PURCHASE_ORDER_STATUS,
  PAGINATION,
} from "../definitions.js";
import authService from "./auth.service";
import { processInventoryUpdates } from "./inventory.service";
const { PurchaseOrder, PurchaseOrderItem, ProductCombination, Product } = db;

const purchaseOrderService = {
  async get(id) {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        // attributes: {
        //   exclude: ["orderBy", "receivedBy", "completedBy", "cancelledBy"],
        // },
        include: [
          {
            model: PurchaseOrderItem,
            as: "purchaseOrderItems",
            // where: { orderId: id },
            attributes: { exclude: ["createdAt", "updatedAt"] },
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
      throw error;
    }

    const transaction = await sequelize.transaction();
    try {
      const {
        purchaseOrderNumber,
        supplierId,
        orderDate,
        deliveryDate,
        notes,
        internalNotes,
        purchaseOrderItems,
        modeOfPayment,
        checkNumber,
        dueDate,
      } = payload;

      const totalAmount = purchaseOrderItems.reduce(
        (total: number, item: any) => total + item.unitPrice * item.quantity,
        0
      );

      const processedItems = await Promise.all(
        purchaseOrderItems.map(async (item) => {
          const productCombination = await ProductCombination.findByPk(
            item.combinationId
          );

          const props = {
            ...item,
            // orderId: result.id,
            // combinationId: item.combinationId,
            // quantity: item.quantity,
            originalPrice: productCombination.price,
            // unitPrice: item.unitPrice,
            // discount: item.discount,
            // discountNote: item.discountNote,
          };

          return props;
        })
      );

      const result = await PurchaseOrder.create(
        {
          purchaseOrderNumber,
          supplierId,
          orderDate,
          deliveryDate,
          totalAmount,
          orderBy: user.id,
          notes,
          internalNotes,
          purchaseOrderItems: processedItems,
          modeOfPayment,
          checkNumber,
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
      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      console.log(1, error);

      throw error;
    }
  },

  async list() {
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

  async update(id, payload) {
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

    switch (true) {
      case purchaseOrder.status === PURCHASE_ORDER_STATUS.PENDING &&
        payload.status === PURCHASE_ORDER_STATUS.RECEIVED:
        await processReceivedOrder(payload, purchaseOrder);
        break;
      case purchaseOrder.status === PURCHASE_ORDER_STATUS.RECEIVED &&
        payload.status === PURCHASE_ORDER_STATUS.COMPLETED:
        await processCompletedOrder(payload, purchaseOrder);
        break;
      case purchaseOrder.status === PURCHASE_ORDER_STATUS.PENDING &&
        payload.status === PURCHASE_ORDER_STATUS.PENDING:
        await processUpdateOrder(payload, purchaseOrder);
        break;
      default:
        throw new Error(
          `Invalid status change from ${purchaseOrder.status} to ${payload.status}`
        );
    }
  },

  async delete(id) {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        throw new Error("PurchaseOrder not found");
      }

      if (purchaseOrder.status !== PURCHASE_ORDER_STATUS.PENDING) {
        await purchaseOrder.destroy();
      } else {
        throw new Error("PurchaseOrder is not in a valid state");
      }
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

  async cancelOrder(id, payload) {
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
    await processCancelledOrder(payload, purchaseOrder);
  },
};

const processCompletedOrder = async (payload, purchaseOrder) => {
  await db.sequelize.transaction(async (transaction: Transaction) => {
    const user = await authService.getCurrent();
    try {
      await updateOrder(
        {
          ...payload,
          status: PURCHASE_ORDER_STATUS.COMPLETED,
          completedBy: user.id,
          completedDate: new Date(),
        },
        purchaseOrder,
        transaction,
        true
      );
    } catch (error) {
      throw new Error("Error in processCompletedOrder");
    }
  });
};

const processCancelledOrder = async (payload, purchaseOrder) => {
  await db.sequelize.transaction(async (transaction: Transaction) => {
    const user = await authService.getCurrent();
    try {
      await updateOrder(
        {
          ...payload,
          status: PURCHASE_ORDER_STATUS.CANCELLED,
          cancelledBy: user.id,
          cancelledDate: new Date(),
        },
        purchaseOrder,
        transaction
      );
    } catch (error) {
      console.log(333, error);

      throw new Error("Error in processCancelledOrder");
    }
    try {
      const { purchaseOrderItems, id } = purchaseOrder;
      await Promise.all(
        purchaseOrderItems.map(async (item) => {
          await processInventoryUpdates(
            item,
            id,
            INVENTORY_MOVEMENT_TYPE.CANCEL_PURCHASE,
            transaction,
            false
          );
        })
      );
    } catch (error) {
      throw new Error("Error in processInventoryUpdates");
    }
  });
};

const processReceivedOrder = async (payload, purchaseOrder) => {
  await db.sequelize.transaction(async (transaction: Transaction) => {
    const user = await authService.getCurrent();
    try {
      await updateOrder(
        {
          ...payload,
          status: PURCHASE_ORDER_STATUS.RECEIVED,
          receivedBy: user.id,
          receivedDate: new Date(),
        },
        purchaseOrder,
        transaction,
        true
      );
    } catch (error) {
      throw error;
    }
    try {
      const { purchaseOrderItems, id } = purchaseOrder;
      await Promise.all(
        purchaseOrderItems.map(async (item) => {
          await processInventoryUpdates(
            {
              combinationId: item.combinationId,
              quantity: item.quantity,
            },
            id,
            null,
            INVENTORY_MOVEMENT_TYPE.IN,
            transaction
          );
        })
      );
    } catch (error) {
      console.log(1, error);

      throw new Error("Error in processInventoryUpdates");
    }
  });
};
const processUpdateOrder = async (payload, purchaseOrder) => {
  await db.sequelize.transaction(async (transaction: Transaction) => {
    try {
      await updateOrder(payload, purchaseOrder, transaction, true);
    } catch (error) {
      throw new Error("Error in processUpdateOrder");
    }
  });
};

const updateOrder = async (
  payload,
  purchaseOrder,
  transaction,
  updateOrderItems = false
) => {
  try {
    await purchaseOrder.update(payload, { transaction });
  } catch (error) {
    throw new Error("Error in updateOrder");
  }
  try {
    if (updateOrderItems) {
      await PurchaseOrderItem.destroy({
        where: { orderId: purchaseOrder.id },
        transaction,
      });

      const items = await Promise.all(
        payload.purchaseOrderItems.map(async (item) => {
          const productCombination = await ProductCombination.findByPk(
            item.combinationId
          );

          const props = {
            ...item,
            originalPrice: productCombination.price,
            orderId: purchaseOrder.id,
          };
          return props;
        })
      );

      await PurchaseOrderItem.bulkCreate(items, { transaction });
    }
  } catch (error) {
    throw new Error("Error in updateOrderItems");
  }
};

export default purchaseOrderService;
