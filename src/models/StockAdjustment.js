const { STOCK_ADJUSTMENT_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const StockAdjustment = sequelize.define(
    "StockAdjustment",
    {
      referenceNo: DataTypes.STRING,
      combinationId: DataTypes.INTEGER,
      systemQuantity: DataTypes.INTEGER,
      newQuantity: DataTypes.INTEGER,
      difference: DataTypes.INTEGER,
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [Object.values(STOCK_ADJUSTMENT_TYPE)] },
      },
      notes: DataTypes.STRING,
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ["updatedAt"] },
      },
      paranoid: true,
    }
  );

  StockAdjustment.associate = (models) => {
    StockAdjustment.hasMany(models.InventoryMovement, {
      foreignKey: "referenceId",
    });
    StockAdjustment.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "user",
    });
    StockAdjustment.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combination",
    });
  };

  return StockAdjustment;
};
