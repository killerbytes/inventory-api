const { Model, DataTypes } = require("sequelize");

class SalesOrderItem extends Model {
  static associate(models) {
    SalesOrderItem.belongsTo(models.SalesOrder, {
      foreignKey: "orderId",
      as: "salesOrder",
    });

    SalesOrderItem.belongsTo(models.Inventory, {
      foreignKey: "inventoryId",
      as: "inventory",
    });
  }
}

module.exports = (sequelize) => {
  SalesOrderItem.init(
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      inventoryId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      originalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "SalesOrderItem",
    }
  );

  return SalesOrderItem;
};
