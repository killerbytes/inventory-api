const { INVENTORY_MOVEMENT_TYPE } = require("../definitions");

module.exports = (sequelize, DataTypes) => {
  const InventoryBreakPack = sequelize.define("InventoryBreakPack", {
    fromCombinationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toCombinationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fromQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  InventoryBreakPack.associate = (models) => {};

  return InventoryBreakPack;
};
