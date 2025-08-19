const { INVENTORY_MOVEMENT_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const InventoryMovement = sequelize.define("InventoryMovement", {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(INVENTORY_MOVEMENT_TYPE)],
      },
    },
    previous: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    new: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: DataTypes.STRING,
  });

  InventoryMovement.associate = (models) => {
    InventoryMovement.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    InventoryMovement.belongsTo(models.ProductCombination, {
      foreignKey: "combinationId",
      as: "combination",
    });

    InventoryMovement.belongsTo(models.StockAdjustment, {
      foreignKey: "referenceId",
    });
  };

  return InventoryMovement;
};
