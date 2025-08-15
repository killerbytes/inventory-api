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
      salesOrderId: { type: DataTypes.INTEGER, allowNull: false },
      combinationId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      unit: { type: DataTypes.STRING, allowNull: false },
      discountNote: DataTypes.TEXT,
      skuSnapshot: { type: DataTypes.STRING, allowNull: false },
      nameSnapshot: { type: DataTypes.STRING, allowNull: false },
      categorySnapshot: { type: DataTypes.JSON, allowNull: false },
      variantSnapshot: { type: DataTypes.JSON, allowNull: false },
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
