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
      purchaseOrderId: { type: DataTypes.INTEGER, allowNull: false },
      combinationId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
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
      discountNote: DataTypes.TEXT,
      unit: { type: DataTypes.STRING, allowNull: false },
      skuSnapshot: { type: DataTypes.STRING, allowNull: false },
      nameSnapshot: { type: DataTypes.STRING, allowNull: false },
      categorySnapshot: { type: DataTypes.JSON, allowNull: false },
      variantSnapshot: { type: DataTypes.JSON, allowNull: false },
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
