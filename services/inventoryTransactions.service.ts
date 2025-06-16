import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db from "../models";
import ApiError from "./ApiError";
import { inventoryTransactionSchema } from "../schema.js";
import authService from "./auth.service";
const { Inventory, InventoryTransaction, Product } = db;

const inventoryTransactionService = {
  async create(payload, transaction) {
    const { error } = inventoryTransactionSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const { inventoryId, previousValue, newValue, value, transactionType } =
        payload;

      const user = await authService.getCurrent();

      const result = await InventoryTransaction.create(
        {
          inventoryId,
          previousValue,
          newValue,
          value,
          transactionType,
          orderId: null,
          orderType: null,
          user: user.id,
        },
        { ...transaction }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query) {
    const { q = null, transactionType = null } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = {
        [Op.and]: [
          ...(q
            ? [{ "$inventory.product.name$": { [Op.like]: `%${q}%` } }]
            : []),
          ...(transactionType
            ? [{ transactionType: { [Op.like]: `%${transactionType}%` } }]
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
    } catch (error) {
      throw error;
    }
  },
};

export default inventoryTransactionService;
