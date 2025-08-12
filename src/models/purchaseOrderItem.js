const { Model, DataTypes } = require("sequelize");

class PurchaseOrderItem extends Model {
  static associate(models) {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, {
      foreignKey: "purchaseOrderId",
      as: "purchaseOrder",
    });

    PurchaseOrderItem.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combinations",
    });
  }
}

module.exports = (sequelize) => {
  PurchaseOrderItem.init(
    {
      purchaseOrderId: { type: DataTypes.INTEGER },
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
      modelName: "PurchaseOrderItem",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return PurchaseOrderItem;
};
