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
      modelName: "Supplier",
    }
  );

  return Supplier;
};
