import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db from "../models/index.js";
const {
  VariantType,
  VariantValue,
  InventoryMovement,
  ProductCombination,
  User,
  Product,
} = db;

const inventoryTransactionService = {
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

      const { count, rows } = await InventoryMovement.findAndCountAll({
        limit,
        offset,
        order,
        where,
        nest: true,
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ProductCombination,
            as: "combination",
            include: [
              {
                model: Product,
                as: "product",
                include: [{ model: VariantType, as: "variants" }],
              },
              {
                model: VariantValue,
                as: "values",
                through: { attributes: [] },
              },
            ],
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
