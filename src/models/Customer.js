const { Model, DataTypes } = require("sequelize");

class Customer extends Model {
  static associate(models) {
    Customer.hasMany(models.SalesOrder, {
      foreignKey: "customerId",
      as: "salesOrders",
    });
  }
}

module.exports = (sequelize) => {
  Customer.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      contact: { type: DataTypes.STRING },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.TEXT },
      address: { type: DataTypes.STRING, allowNull: false },
      notes: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return Customer;
};
