const { Model, DataTypes } = require("sequelize");
const { ORDER_TYPE, RETURN_TYPE } = require("../definitions");

class ReturnTransaction extends Model {
  static associate(models) {
    ReturnTransaction.hasMany(models.ReturnItem, {
      foreignKey: "returnTransactionId",
      as: "returnItems",
    });
  }
}

module.exports = (sequelize) => {
  ReturnTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sourceType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [Object.values(ORDER_TYPE)],
        },
      },
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalReturnAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDifference: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
      modelName: "ReturnTransaction",
      defaultScope: {
        attributes: { exclude: ["createdAt", "deletedAt"] },
      },
      timestamps: true,
    }
  );

  return ReturnTransaction;
};
