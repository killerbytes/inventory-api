import { Transaction } from "sequelize";
import ApiError from "./ApiError";
import db from "../models";
import { purchaseOrderSchema } from "../schema";
import { PURCHASE_ORDER_STATUS, PAGINATION } from "../definitions.js";
import { Op } from "sequelize";
import { purchaseOrderStatusSchema } from "../schema";
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

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    const { error } = purchaseOrderSchema.validate(params, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        throw new Error("PurchaseOrder not found");
      }
      await purchaseOrder.update(params);
      return purchaseOrder;
    } catch (error) {
      throw error;
    }
  },
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
      if (
        purchaseOrder.status === PURCHASE_ORDER_STATUS.PENDING ||
        purchaseOrder.status === PURCHASE_ORDER_STATUS.COMPLETED
      ) {
        await db.sequelize.transaction(async (transaction: Transaction) => {
          const status =
            purchaseOrder.status === PURCHASE_ORDER_STATUS.PENDING
              ? PURCHASE_ORDER_STATUS.COMPLETED
              : PURCHASE_ORDER_STATUS.CANCELLED;
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

      return purchaseOrder;
    } catch (error: any) {
      throw error;
    }
  },
};

export default purchaseOrderService;
