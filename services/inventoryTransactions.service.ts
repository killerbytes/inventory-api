import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db from "../models";
const { Inventory, InventoryTransaction, Product, SalesOrder, PurchaseOrder } =
  db;

const inventoryTransactionService = {
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
