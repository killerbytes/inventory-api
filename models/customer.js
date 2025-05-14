const { Model, DataTypes } = require("sequelize");

class Customer extends Model {
  static associate(models) {
    // Define associations here
  }
}

module.exports = (sequelize) => {
  Customer.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      contact: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      notes: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "Customer",
    }
  );

  return Customer;
};
