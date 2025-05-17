const { Model, DataTypes } = require("sequelize");

class SalesOrder extends Model {
  static associate(models) {
    SalesOrder.hasMany(models.SalesOrderItem, {
      foreignKey: "orderId",
      as: "salesOrderItems",
    });
    SalesOrder.belongsTo(models.User, {
      foreignKey: "orderBy",
      as: "orderByUser",
    });
    SalesOrder.belongsTo(models.User, {
      foreignKey: "receivedBy",
      as: "receivedByUser",
    });
  }
}

module.exports = (sequelize) => {
  SalesOrder.init(
    {
      customer: { type: DataTypes.STRING, allowNull: false },
      orderDate: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.ENUM("DRAFT", "PENDING", "COMPLETED", "CANCELLED"),
        defaultValue: "Pending",
      },
      deliveryDate: { type: DataTypes.DATE },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          conditionalRequired(value) {
            if (this.status === "COMPLETED" && !value) {
              throw new Error(
                "receivedDate is required when status is completed"
              );
            }
          },
        },
      },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      orderBy: { type: DataTypes.INTEGER, allowNull: false },
      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          conditionalRequired(value) {
            if (this.status === "COMPLETED" && !value) {
              throw new Error(
                "receivedBy is required when status is completed"
              );
            }
          },
        },
      },
      notes: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "SalesOrder",
    }
  );

  return SalesOrder;
};
