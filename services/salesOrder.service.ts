import { Transaction } from "sequelize";
import ApiError from "./ApiError";
import db from "../models";
import { salesOrderSchema, salesOrderStatusSchema } from "../schema";
import { SALES_ORDER_STATUS, PAGINATION } from "../definitions.js";
import { Op } from "sequelize";
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
  async create(payload, user) {
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

      const result = await db.sequelize.transaction(async (t: Transaction) => {
        const result = await SalesOrder.create(
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
            transaction: t,
            include: [
              {
                model: SalesOrderItem,
                as: "salesOrderItems",
              },
            ],
          }
        );

        return result;
      });
      return result;
    } catch (error: any) {
      console.log(123, error);

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
      await salesOrder.update(payload);
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
        });
      }

      return salesOrder;
    } catch (error: any) {
      throw error;
    }
  },
};

export default salesOrderService;
