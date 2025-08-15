const { Model, DataTypes } = require("sequelize");

class Supplier extends Model {
  static associate(models) {
    Supplier.hasMany(models.PurchaseOrder, {
      foreignKey: "supplierId",
      as: "purchaseOrders",
    });
  }
}

module.exports = (sequelize) => {
  Supplier.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      contact: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
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
    }
  );

  return Supplier;
};
