const { INVENTORY_MOVEMENT_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const InventoryMovement = sequelize.define("InventoryMovement", {
    type: {
      type: DataTypes.ENUM(Object.keys(INVENTORY_MOVEMENT_TYPE)),
      allowNull: false,
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
  };

  return InventoryMovement;
};
