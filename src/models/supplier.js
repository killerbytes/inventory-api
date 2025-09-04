const { Model, DataTypes } = require("sequelize");

class Supplier extends Model {
  static associate(models) {
    Supplier.hasMany(models.GoodReceipt, {
      foreignKey: "supplierId",
      as: "goodReceipts",
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

  return Supplier;
};
