import { NextFunction, Request, Response } from "express";
import { Transaction } from "sequelize";
import ApiError from "../services/ApiError";

const db = require("../models");
const { SalesOrder, SalesOrderItem, Product, Inventory } = db;
const {
  salesOrderSchema,
  salesOrderStatusSchema,
} = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");
const { ORDER_STATUS } = require("../utils/definitions");
const { getCurrentUser } = require("../services/AuthService");

const SalesOrderController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
    try {
      console.log(id);

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
        return res.status(404).json({
          error: {
            message: "SalesOrder not found",
          },
        });
      }
      return res.status(200).json(salesOrder);
    } catch (error) {
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = salesOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const err = ApiError.sequelizeError(error);
      return res.status(400).json(err);
    }

    try {
      const user = await getCurrentUser(req);

      const { customer, orderDate, deliveryDate, notes, salesOrderItems } =
        req.body;

      const totalAmount = salesOrderItems.reduce(
        (total: number, item: any) => total + item.unitPrice * item.quantity,
        0
      );

      const result = await db.sequelize.transaction(async (t: Transaction) => {
        const result = await SalesOrder.create(
          {
            customer,
            orderDate,
            status: ORDER_STATUS.COMPLETED,
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
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json(ApiError.badRequest(error.message));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
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
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = salesOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        return res.status(404).json({ message: "SalesOrder not found" });
      }
      await salesOrder.update(req.body);
      return res.status(200).json(salesOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        return res.status(404).json({ message: "SalesOrder not found" });
      }
      await salesOrder.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req: Request, res: Response) {
    const { query } = req;
    const limit = parseInt(query.limit as string) || 10;
    const page = parseInt(query.page as string) || 1;
    const q = req.query.q || null;
    const where = q ? { name: { [Op.like]: `%${q}%` } } : null;
    const offset = (page - 1) * limit;
    try {
      const order = [];
      if (req.query.sort) {
        order.push([req.query.sort, req.query.order || "ASC"]);
      } else {
        // order.push(["id", "ASC"]); // Default sort
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
      return res.status(200).json({
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = salesOrderStatusSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }

    const user = await getCurrentUser(req);

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
        return res.status(404).json({ message: "Sales Order not found" });
      }

      if (salesOrder.status === ORDER_STATUS.COMPLETED) {
        await db.sequelize.transaction(async (transaction: Transaction) => {
          const status = ORDER_STATUS.CANCELLED;
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

      return res.status(200).json(salesOrder);
    } catch (error: any) {
      console.log(222, error);

      return res.status(500).json(ApiError.badRequest(error.message));
    }
  },
};

module.exports = SalesOrderController;
