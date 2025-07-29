const { Model, DataTypes } = require("sequelize");

class PurchaseOrderItem extends Model {
  static associate(models) {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, {
      foreignKey: "orderId",
      as: "purchaseOrder",
    });

    PurchaseOrderItem.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}

module.exports = (sequelize) => {
  PurchaseOrderItem.init(
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      unit: { type: DataTypes.STRING, allowNull: false },
      unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discountNote: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "PurchaseOrderItem",
    }
  );

  return PurchaseOrderItem;
};
