module.exports = (sequelize, DataTypes) => {
  const BreakPack = sequelize.define("BreakPack", {
    fromCombinationId: {
      // the pack
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toCombinationId: {
      // the singles
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      // how many packs broken
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conversionFactor: {
      // singles per pack
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  BreakPack.associate = (models) => {
    BreakPack.belongsTo(models.ProductCombination, {
      foreignKey: "fromCombinationId",
      as: "fromCombination",
    });
    BreakPack.belongsTo(models.ProductCombination, {
      foreignKey: "toCombinationId",
      as: "toCombination",
    });
    BreakPack.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "user",
    });
  };

  return BreakPack;
};
