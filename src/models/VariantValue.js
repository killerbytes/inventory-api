"use strict";
module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define(
    "VariantValue",
    {
      value: { type: DataTypes.STRING, allowNull: false },
      variantTypeId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  VariantValue.associate = (models) => {
    VariantValue.belongsTo(models.VariantType, { foreignKey: "variantTypeId" });
    VariantValue.belongsToMany(models.ProductCombination, {
      through: models.CombinationValue,
      foreignKey: "variantValueId",
    });
  };

  // models/variantvalue.js (add this in the same file, after associations)
  const { Op } = require("sequelize");

  VariantValue.addHook("beforeDestroy", async (variantValue, options) => {
    // Use provided transaction if present, otherwise create one
    const sequelize = variantValue.sequelize || require("../models").sequelize;
    const transactionProvided = Boolean(options && options.transaction);

    const t = options.transaction || (await sequelize.transaction());

    try {
      // Find combination-rows (join table) that reference this variantValue
      // CombinationValues model is available via sequelize.models
      const { CombinationValue, ProductCombination, Inventory } =
        sequelize.models;

      // find all combinationIds referencing this variantValue
      const combRows = await CombinationValue.findAll({
        where: { variantValueId: variantValue.id },
        attributes: ["combinationId"],
        transaction: t,
      });

      if (!combRows.length) {
        if (!transactionProvided) await t.commit();
        return;
      }

      const combinationIds = [...new Set(combRows.map((r) => r.combinationId))];

      // Load combinations + their inventory (one query)
      const combos = await ProductCombination.findAll({
        where: { id: { [Op.in]: combinationIds } },
        include: [{ model: Inventory, as: "inventory" }],
        transaction: t,
        paranoid: false, // include soft-deleted? adjust based on your needs
      });

      // If any combo has inventory > 0, block deletion
      for (const combo of combos) {
        const inv = combo.inventory || null;
        if (inv && Number(inv.quantity) > 0) {
          throw new Error(
            `Cannot delete variant value "${
              variantValue.value
            }" — product combination "${combo.sku || combo.id}" has inventory ${
              inv.quantity
            }.`
          );
        }
      }

      // Safe to delete: delete inventories first, then product combinations
      for (const combo of combos) {
        if (combo.inventory) {
          await combo.inventory.destroy({ transaction: t });
        }
        // remove the product combination; CombinationValues rows will be cleaned by DB cascade
        await combo.destroy({ transaction: t });
      }

      if (!transactionProvided) await t.commit();
    } catch (err) {
      if (!transactionProvided) await t.rollback();
      throw err;
    }
  });

  return VariantValue;
};
