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
      email: {
        type: DataTypes.STRING,
        validate: { isEmail: true },
      },
      phone: DataTypes.TEXT,
      address: DataTypes.STRING,
      notes: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
          where: {
            deletedAt: null, // enforce uniqueness only for active rows
          },
        },
      ],
      paranoid: true,
    }
  );

  return Customer;
};
