const { Model, DataTypes } = require("sequelize");

class PurchaseOrderItem extends Model {
  static associate(models) {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, {
      foreignKey: "orderId",
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
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      combinationId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      originalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discountNote: { type: DataTypes.TEXT },
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
