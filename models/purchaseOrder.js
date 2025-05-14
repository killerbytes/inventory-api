const { Model, DataTypes } = require("sequelize");

class PurchaseOrder extends Model {
  static associate(models) {
    PurchaseOrder.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplier",
    });
    PurchaseOrder.hasMany(models.PurchaseOrderItem, {
      foreignKey: "orderId",
      as: "purchaseOrderItems",
    });
    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "orderBy",
      as: "orderByUser",
    });
    PurchaseOrder.belongsTo(models.User, {
      foreignKey: "receivedBy",
      as: "receivedByUser",
    });
  }
}

module.exports = (sequelize) => {
  PurchaseOrder.init(
    {
      supplierId: { type: DataTypes.INTEGER, allowNull: false },
      orderDate: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.ENUM("DRAFT", "PENDING", "COMPLETED", "CANCELLED"),
        defaultValue: "Pending",
      },
      deliveryDate: { type: DataTypes.DATE },
      receivedDate: { type: DataTypes.DATE },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      orderBy: { type: DataTypes.INTEGER, allowNull: false },
      receivedBy: { type: DataTypes.INTEGER, allowNull: false },
      notes: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "PurchaseOrder",
    }
  );

  return PurchaseOrder;
};
