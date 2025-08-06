module.exports = (sequelize, DataTypes) => {
  const CombinationValue = sequelize.define("CombinationValue", {
    combinationId: DataTypes.INTEGER,
    variantValueId: DataTypes.INTEGER,
  });

  return CombinationValue;
};
