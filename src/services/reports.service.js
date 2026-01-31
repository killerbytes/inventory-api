const { Sequelize, sequelize } = require("../models");
const { Op, where } = require("sequelize");
const db = require("../models");
const { PAGINATION } = require("../definitions");

module.exports = {
  async getPopularProducts(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q,
      startDate = null,
      endDate = null,
      status,
      sort = "transactionCount",
      order: sortOrder = "DESC",
    } = params;

    const offset = (page - 1) * limit;

    const orderByMap = {
      name: [{ model: db.ProductCombination, as: "combinations" }, "name"],
      transactionCount: [sequelize.literal('"transactionCount"')],
    };

    try {
      const orderBy = orderByMap[sort]
        ? [...orderByMap[sort], sortOrder]
        : [sort, sortOrder];

      const rows = await db.SalesOrderItem.findAll({
        attributes: [
          "combinationId",
          [
            sequelize.fn(
              "COUNT",
              sequelize.fn("DISTINCT", sequelize.col("salesOrder.id"))
            ),
            "transactionCount",
          ],
        ],
        include: [
          {
            model: db.SalesOrder,
            as: "salesOrder",
            attributes: [],
            where: {
              status: "RECEIVED",
              ...(startDate &&
                endDate && {
                  orderDate: { [Op.between]: [startDate, endDate] },
                }),
            },
          },
          {
            model: db.ProductCombination,
            as: "combinations",
          },
        ],
        group: ["combinationId", "combinations.id"],
        order: [orderBy],
        limit,
        offset,
      });

      const count = await db.SalesOrderItem.count({
        distinct: true,
        col: "combinationId",
        include: [
          {
            model: db.SalesOrder,
            as: "salesOrder",
            where: {
              status: "RECEIVED",
              ...(startDate &&
                endDate && {
                  orderDate: { [Op.between]: [startDate, endDate] },
                }),
            },
          },
        ],
      });
      const result = {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
        },
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async getProfitProducts(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q,
      startDate = null,
      endDate = null,
      status,
      sort = "transactionCount",
      order: sortOrder = "DESC",
    } = params;
    const offset = (page - 1) * limit;

    const orderByMap = {
      name: [{ model: db.ProductCombination, as: "combinations" }, "name"],
      totalProfit: [sequelize.literal('"totalProfit"')],
    };

    try {
      const orderBy = orderByMap[sort]
        ? [...orderByMap[sort], sortOrder]
        : [sort, sortOrder];

      const rows = await db.SalesOrderItem.findAll({
        attributes: [
          "combinationId",
          "nameSnapshot",
          "unit",
          [
            sequelize.literal(`
              SUM("SalesOrderItem"."quantity" )`),
            "totalQuantity",
          ],
          [
            sequelize.literal(`
       SUM(
         ("SalesOrderItem"."purchasePrice" - "combinations->inventory"."averagePrice")
         * "SalesOrderItem"."quantity"
       )
     `),
            "totalProfit",
          ],
        ],
        include: [
          {
            model: db.SalesOrder,
            as: "salesOrder",
            where: {
              status: "RECEIVED",
              ...(startDate &&
                endDate && {
                  orderDate: { [Op.between]: [startDate, endDate] },
                }),
            },
          },
          {
            model: db.ProductCombination,
            as: "combinations",
            include: [
              {
                model: db.Inventory,
                as: "inventory",
                attributes: ["averagePrice"],
              },
            ],
          },
        ],
        group: [
          "SalesOrderItem.nameSnapshot",
          "SalesOrderItem.unit",
          "salesOrder.id",
          "SalesOrderItem.combinationId",
          "combinations.id",
          "combinations->inventory.id",
        ],
        order: [orderBy],
        offset,
        limit,
        subQuery: false,
      });
      const count = await db.SalesOrderItem.count({
        distinct: true,
        col: "combinationId",
        include: [
          {
            model: db.SalesOrder,
            as: "salesOrder",
            where: {
              status: "RECEIVED",
              ...(startDate &&
                endDate && {
                  orderDate: { [Op.between]: [startDate, endDate] },
                }),
            },
          },
        ],
      });

      const result = {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
        },
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async noSaleProducts(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q,
      startDate = null,
      endDate = null,
      status,
      sort = "quantity",
      order: sortOrder = "DESC",
    } = params;

    const where = { "$salesOrderItems.id$": null };

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { sku: { [Op.like]: `%${q}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const offset = (page - 1) * limit;

    const orderByMap = {
      quantity: [sequelize.literal('"inventory.quantity"')],
    };

    try {
      const orderBy = orderByMap[sort]
        ? [...orderByMap[sort], sortOrder]
        : [sort, sortOrder];

      const { rows, count } = await db.ProductCombination.findAndCountAll({
        include: [
          {
            model: db.Inventory,
            as: "inventory",
            where: {
              quantity: {
                [Op.gt]: 0,
              },
            },
          },
          {
            model: db.SalesOrderItem,
            as: "salesOrderItems",
            required: false, // LEFT JOIN
            attributes: [],
            include: [
              {
                model: db.SalesOrder,
                as: "salesOrder",
                required: false,
                attributes: [],
                where: {
                  status: "RECEIVED",
                },
              },
            ],
          },
        ],
        order: [orderBy],
        subQuery: false,
        limit,
        offset,
        where: Object.keys(where).length ? where : undefined,
        nest: true,
        distinct: true,
      });

      const result = {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
        },
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
