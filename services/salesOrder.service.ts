import { Transaction } from "sequelize";
import ApiError from "./ApiError";
import db from "../models";
import { salesOrderSchema, salesOrderStatusSchema } from "../schema";
import {
  ORDER_TYPE,
  INVENTORY_TRANSACTION_TYPE,
  SALES_ORDER_STATUS,
  PAGINATION,
} from "../definitions.js";
import { Op } from "sequelize";
import authService from "./auth.service";
const { SalesOrder, SalesOrderItem, Product, Inventory } = db;

const salesOrderService = {
  async get(id) {
    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            include: [
              {
                model: Inventory,
                as: "inventory",
                include: [
                  {
                    model: Product,
                    as: "product",
                  },
                ],
              },
            ],
          },
          {
            model: db.User,
            as: "receivedByUser",
          },
        ],
        nest: true,
      });
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }
      return salesOrder;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const user = await authService.getCurrent();
    const { error } = salesOrderSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }

    try {
      const { customer, orderDate, deliveryDate, notes, salesOrderItems } =
        payload;

      const totalAmount = salesOrderItems.reduce(
        (total: number, item: any) => total + item.unitPrice * item.quantity,
        0
      );

      const result = await db.sequelize.transaction(
        async (transaction: Transaction) => {
          try {
            const salesOrder = await SalesOrder.create(
              {
                customer,
                orderDate,
                status: SALES_ORDER_STATUS.COMPLETED,
                deliveryDate,
                receivedDate: new Date(),
                totalAmount,
                receivedBy: user.id,
                notes,
                salesOrderItems,
              },
              {
                transaction,
                include: [
                  {
                    model: SalesOrderItem,
                    as: "salesOrderItems",
                  },
                ],
              }
            );
            if (salesOrder.status === SALES_ORDER_STATUS.COMPLETED) {
              await processCompletedOrder(salesOrder, user.id, transaction);
            }
            return salesOrder;
          } catch (error) {
            throw error;
          }
        }
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getAll() {
    const result = await SalesOrder.findAll({
      include: [
        {
          model: SalesOrderItem,
          as: "salesOrderItems",
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
    const { error } = salesOrderSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }

      const result = await db.sequelize.transaction(
        async (transaction: Transaction) => {
          try {
            await salesOrder.update(payload, { transaction });
            return salesOrder;
          } catch (error) {
            throw error;
          }
        }
      );
      return salesOrder;
    } catch (error) {
      throw error;
    }
  },
  async delete(id) {
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }
      await salesOrder.destroy();
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query) {
    const { status = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = status ? { status } : null;
      const offset = (page - 1) * limit;
      const order = [];
      if (sort) {
        switch (sort) {
          default:
            order.push([sort, query.order || "ASC"]);
            break;
        }
      } else {
        order.push(["orderDate", "ASC"]); // Default sort
      }

      const { count, rows } = await SalesOrder.findAndCountAll({
        limit,
        offset,
        order,
        where,
        nest: true,
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            include: [
              {
                model: Inventory,
                as: "inventory",
              },
            ],
          },
          {
            model: db.User,
            as: "receivedByUser",
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
    const { error } = salesOrderStatusSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }

    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            include: [
              {
                model: Inventory,
                as: "inventory",
                include: [
                  {
                    model: Product,
                    as: "product",
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!salesOrder) {
        throw new Error("Sales Order not found");
      }

      if (salesOrder.status === SALES_ORDER_STATUS.COMPLETED) {
        await db.sequelize.transaction(async (transaction: Transaction) => {
          const status = SALES_ORDER_STATUS.CANCELLED;
          try {
            await salesOrder.update(
              {
                status,
                receivedBy: user.id,
                receivedDate: new Date(),
              },
              {
                transaction,
              }
            );
          } catch (error) {
            throw error;
          }
          try {
            await processCancelledOrder(salesOrder, user.id, transaction);
          } catch (error) {
            throw error;
          }
        });
      }

      return salesOrder;
    } catch (error: any) {
      throw error;
    }
  },
};

const processCompletedOrder = async (salesOrder, userId, transaction) => {
  const orderWithItems = await salesOrder.sequelize.models.SalesOrder.findByPk(
    salesOrder.id,
    {
      include: [
        {
          association: "salesOrderItems",
          include: ["inventory"],
        },
      ],
      transaction,
    }
  );

  await Promise.all(
    orderWithItems.salesOrderItems.map(async (item) => {
      const [inventory] =
        await salesOrder.sequelize.models.Inventory.findOrCreate({
          where: { productId: item.inventory.productId },
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
          defaults: {
            productId: item.inventory.productId,
            quantity: 0,
          },
          transaction,
        });

      if (inventory.quantity - item.quantity < 0) {
        throw new Error(
          "Quantity is less than zero: " + inventory.product.name
        );
      }

      await salesOrder.sequelize.models.InventoryTransaction.create(
        {
          inventoryId: inventory.id,
          previousValue: inventory.quantity,
          newValue: parseInt(inventory.quantity) - parseInt(item.quantity),
          value: item.quantity,
          transactionType: INVENTORY_TRANSACTION_TYPE.SALE,
          orderId: orderWithItems.id,
          orderType: ORDER_TYPE.SALES,
          userId,
        },
        { transaction }
      );

      await inventory.update(
        {
          quantity: parseInt(inventory.quantity) - parseInt(item.quantity),
        },
        { transaction }
      );
    })
  );
};

const processCancelledOrder = async (salesOrder, userId, transaction) => {
  const orderWithItems = await salesOrder.sequelize.models.SalesOrder.findByPk(
    salesOrder.id,
    {
      include: [
        {
          association: "salesOrderItems",
          include: ["inventory"],
        },
      ],
      transaction,
    }
  );

  await Promise.all(
    orderWithItems.salesOrderItems.map(async (item) => {
      console.log(2, item);

      const [inventory] =
        await salesOrder.sequelize.models.Inventory.findOrCreate({
          where: { productId: item.inventory.productId },
          defaults: { productId: item.inventoryId, quantity: 0 },
          transaction,
        });

      await salesOrder.sequelize.models.InventoryTransaction.create(
        {
          inventoryId: inventory.id,
          previousValue: inventory.quantity,
          newValue: parseInt(inventory.quantity) + parseInt(item.quantity),
          value: item.quantity,
          transactionType: INVENTORY_TRANSACTION_TYPE.CANCELLATION,
          orderId: orderWithItems.id,
          orderType: ORDER_TYPE.SALES,
          userId,
        },
        { transaction }
      );

      await inventory.update(
        {
          quantity: parseInt(inventory.quantity) + parseInt(item.quantity),
        },
        { transaction }
      );
    })
  );
};

export default salesOrderService;
