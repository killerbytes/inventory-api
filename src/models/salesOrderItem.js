const { Model, DataTypes } = require("sequelize");

class SalesOrderItem extends Model {
  static associate(models) {
    SalesOrderItem.belongsTo(models.PurchaseOrder, {
      foreignKey: "salesOrderId",
      as: "salesOrder",
    });

    SalesOrderItem.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combinations",
    });
  }
}

module.exports = (sequelize) => {
  SalesOrderItem.init(
    {
      salesOrderId: { type: DataTypes.INTEGER },
      combinationId: { type: DataTypes.INTEGER },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      originalPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      purchasePrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      unit: DataTypes.STRING,
      discountNote: DataTypes.TEXT,
      skuSnapshot: DataTypes.STRING,
      nameSnapshot: DataTypes.STRING,
      categorySnapshot: DataTypes.JSON,
      variantSnapshot: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "SalesOrderItem",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return SalesOrderItem;
};
