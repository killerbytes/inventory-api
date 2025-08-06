import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db from "../models/index.js";
import ApiError from "./ApiError.js";
import authService from "./auth.service.js";
const { Inventory, InventoryTransaction, Product, User } = db;

const inventoryTransactionService = {
  // async create(payload, transaction) {
  //   const { error } = inventoryTransactionSchema.validate(payload, {
  //     abortEarly: false,
  //   });
  //   if (error) {
  //     throw error;
  //   }
  //   try {
  //     const { inventoryId, previousValue, newValue, value, transactionType } =
  //       payload;

  //     const user = await authService.getCurrent();

  //     const result = await InventoryTransaction.create(
  //       {
  //         inventoryId,
  //         previousValue,
  //         newValue,
  //         value,
  //         transactionType,
  //         orderId: null,
  //         orderType: null,
  //         userId: user.id,
  //       },
  //       { ...transaction }
  //     );

  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  async getPaginated(query) {
    const {
      q = null,
      transactionType = null,
      sort = "updatedAt",
      startDate,
      endDate,
    } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where: any = {
        [Op.and]: [
          ...(q
            ? [{ "$inventory.product.name$": { [Op.like]: `%${q}%` } }]
            : []),
          ...(transactionType
            ? [{ transactionType: { [Op.like]: `%${transactionType}%` } }]
            : []),
        ],
      };
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
      const order = [];
      order.push([sort, query.order || "DESC"]);

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
          {
            model: User,
            as: "user",
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
};

export default inventoryTransactionService;
