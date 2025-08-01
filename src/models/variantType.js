module.exports = (sequelize, DataTypes) => {
  const VariantType = sequelize.define("VariantType", {
    name: DataTypes.STRING,
  });

  VariantType.associate = (models) => {
    VariantType.hasMany(models.VariantValue, {
      foreignKey: "variantTypeId",
      as: "values",
    });
  };

  return VariantType;
};
