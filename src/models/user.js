const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

class User extends Model {
  static associate(models) {
    User.hasMany(models.PurchaseOrder, {
      foreignKey: "orderBy",
      as: "purchaseOrders",
    });
    User.hasMany(models.PurchaseOrder, {
      foreignKey: "receivedBy",
      as: "receivedPurchaseOrders",
    });
    User.hasMany(models.PurchaseOrder, {
      foreignKey: "completedBy",
      as: "completedPurchaseOrders",
    });
    User.hasMany(models.PurchaseOrder, {
      foreignKey: "cancelledBy",
      as: "cancelledPurchaseOrders",
    });
    User.hasMany(models.SalesOrder, {
      foreignKey: "receivedBy",
      as: "receivedSalesOrders",
    });

    User.hasMany(models.InventoryTransaction, {
      foreignKey: "userId",
      as: "userInventoryTransactions",
    });
  }
  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }

  static validatePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

module.exports = (sequelize) => {
  User.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
      isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: { exclude: ["password"] }, // Exclude password by default
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password"] }, // Include when specifically needed
        },
      },
      paranoid: true, // Enable soft deletes
      deletedAt: "deletedAt", // Specify the name of the deletedAt column
      timestamps: true, // Enable createdAt and updatedAt
    }
  );

  return User;
};
