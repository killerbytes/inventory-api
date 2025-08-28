"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantType = sequelize.define(
    "VariantType",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      productId: DataTypes.INTEGER,
      isTemplate: DataTypes.BOOLEAN,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  VariantType.associate = (models) => {
    VariantType.belongsTo(models.Product, { foreignKey: "productId" });
    VariantType.hasMany(models.VariantValue, {
      foreignKey: "variantTypeId",
      as: "values",
    });
  };

  // models/varianttype.js (add after associations)
  VariantType.addHook("beforeDestroy", async (variantType, options) => {
    const sequelize = variantType.sequelize || require("../models").sequelize;
    const transactionProvided = Boolean(options && options.transaction);
    const t = options.transaction || (await sequelize.transaction());

    try {
      const { VariantValue } = sequelize.models;
      const values = await VariantValue.findAll({
        where: { variantTypeId: variantType.id },
        transaction: t,
      });

      for (const val of values) {
        // This will trigger VariantValue.beforeDestroy hook
        await val.destroy({ transaction: t });
      }

      if (!transactionProvided) await t.commit();
    } catch (err) {
      if (!transactionProvided) await t.rollback();
      throw err;
    }
  });

  return VariantType;
};
