const { Model, DataTypes } = require("sequelize");
const { RETURN_TYPE } = require("../definitions");

class ReturnItem extends Model {
  static associate(models) {
    ReturnItem.belongsTo(models.ReturnTransaction, {
      foreignKey: "returnTransactionId",
      as: "returnTransactions",
    });
    ReturnItem.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combination",
    });
  }
}
module.exports = (sequelize) => {
  ReturnItem.init(
    {
      returnTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ReturnTransactions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      combinationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ProductCombinations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: false,
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [Object.values(RETURN_TYPE)],
        },
      },
    },
    {
      sequelize,
      modelName: "ReturnItem",
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
      timestamps: true,
    }
  );

  return ReturnItem;
};
