const {
  INVENTORY_MOVEMENT_TYPE,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
} = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const InventoryMovement = sequelize.define("InventoryMovement", {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(INVENTORY_MOVEMENT_TYPE)],
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    costPerUnit: {
      type: DataTypes.DECIMAL(10, 2),
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [Object.values(INVENTORY_MOVEMENT_REFERENCE_TYPE)],
      },
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
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

    // InventoryMovement.belongsTo(models.StockAdjustment, {
    //   foreignKey: "referenceId",
    // });
  };

  return InventoryMovement;
};
