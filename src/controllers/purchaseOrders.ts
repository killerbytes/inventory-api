import { NextFunction, Request, Response } from "express";
import { Transaction } from "sequelize";
import ApiError from "../services/ApiError";
const { PAGINATION } = require("../utils/definitions");
const db = require("../models");
const {
  PurchaseOrder,
  PurchaseOrderItem,
  Product,
  Inventory,
  InventoryTransaction,
} = db;
const {
  purchaseOrderSchema,
  purchaseOrderStatusSchema,
} = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op, where } = require("sequelize");
const {
  ORDER_STATUS,
  INVENTORY_TRANSACTION_TYPE,
} = require("../utils/definitions");

const { getCurrentUser } = require("../services/AuthService");

const PurchaseOrderController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
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
        ],
        // raw: true,
        nest: true,
      });
      if (!purchaseOrder) {
        return res.status(404).json({
          error: {
            message: "PurchaseOrder not found",
          },
        });
      }
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    const user = await getCurrentUser(req);
    const { error } = purchaseOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
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
      } = req.body;

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

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
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
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = purchaseOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      await purchaseOrder.update(req.body);
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      await purchaseOrder.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || PAGINATION.LIMIT;
    const page = parseInt(req.query.page as string) || 1;
    const q = req.query.q || null;
    const { startDate, endDate, status } = req.query;
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
      if (req.query.sort) {
        order.push([
          req.query.sort as string,
          (req.query.order as string) || "ASC",
        ]);
      }
      console.log(123213, where);

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

      return res.status(200).json({
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = purchaseOrderStatusSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }

    const user = await getCurrentUser(req);

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
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      if (
        purchaseOrder.status === ORDER_STATUS.PENDING ||
        purchaseOrder.status === ORDER_STATUS.COMPLETED
      ) {
        await db.sequelize.transaction(async (transaction: Transaction) => {
          const status =
            purchaseOrder.status === ORDER_STATUS.PENDING
              ? ORDER_STATUS.COMPLETED
              : ORDER_STATUS.CANCELLED;
          await purchaseOrder.update(
            {
              status,
              receivedBy: user.id,
              receivedDate: new Date(),
            },
            { transaction }
          );
        });
      }

      return res.status(200).json(purchaseOrder);
    } catch (error: any) {
      return res.status(500).json(ApiError.badRequest(error.message));
    }
  },
};

module.exports = PurchaseOrderController;
