const { Sequelize, sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");

module.exports = {
  async getTopSellingProducts({ startDate, endDate, limit = 10 }) {
    const res = await db.SalesOrderItem.findAll({
      attributes: [
        "combinationId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      include: [
        {
          model: db.ProductCombination,
          as: "combinations",
          attributes: ["id", "name", "sku"],
        },
        {
          model: db.SalesOrder,
          as: "salesOrder",
          attributes: [],
          required: false,
          where: {
            status: "COMPLETED",
            orderDate: { [Op.between]: [startDate, endDate] },
          },
        },
      ],
      group: ["combinationId", "combinations.id"],
      order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
      limit,
    });

    return res;
  },
};
