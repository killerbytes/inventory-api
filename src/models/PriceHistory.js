const { ORDER_STATUS, ORDER_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const PriceHistory = sequelize.define(
    "PriceHistory",
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      combinationId: DataTypes.INTEGER,
      fromPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      toPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      changedBy: { type: DataTypes.INTEGER, allowNull: false },
      changedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  PriceHistory.associate = (models) => {
    PriceHistory.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combinations",
    });

    PriceHistory.belongsTo(models.User, {
      foreignKey: "changedBy",
      as: "user",
    });
  };

  return PriceHistory;
};
