module.exports = (sequelize, DataTypes) => {
  const ProductCombination = sequelize.define(
    "ProductCombination",
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      sku: { type: DataTypes.STRING }, // no unique here anymore
      unit: { type: DataTypes.STRING, allowNull: false },
      conversionFactor: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
      reorderLevel: DataTypes.INTEGER,
      isBreakPack: DataTypes.BOOLEAN,
      isActive: DataTypes.BOOLEAN,
    },
    {
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
      paranoid: true,
      deletedAt: "deletedAt",
      indexes: [
        {
          name: "unique_active_sku",
          unique: true,
          fields: ["sku"],
          where: {
            deletedAt: null, // enforce uniqueness only for active rows
          },
        },
      ],
    }
  );

  ProductCombination.associate = (models) => {
    ProductCombination.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
    ProductCombination.belongsToMany(models.VariantValue, {
      through: models.CombinationValue,
      foreignKey: "combinationId",
      as: "values",
    });
    ProductCombination.hasOne(models.Inventory, {
      foreignKey: "combinationId",
      as: "inventory",
    });

    ProductCombination.hasMany(models.InventoryMovement, {
      foreignKey: "combinationId",
      as: "movements",
    });

    ProductCombination.hasMany(models.PriceHistory, {
      foreignKey: "combinationId",
      as: "combinations",
    });
  };

  // models/productcombination.js (add after associate)
  ProductCombination.addHook("beforeDestroy", async (combo, options) => {
    const sequelize = combo.sequelize || require("../models").sequelize;
    const transactionProvided = Boolean(options && options.transaction);
    const t = options.transaction || (await sequelize.transaction());

    try {
      const { Inventory } = sequelize.models;
      const inv =
        combo.inventory ||
        (await Inventory.findOne({
          where: { combinationId: combo.id },
          transaction: t,
        }));

      if (inv && Number(inv.quantity) > 0) {
        throw new Error(
          `Cannot delete product combination ${
            combo.sku || combo.id
          } — inventory has ${inv.quantity}.`
        );
      }

      // allow deletion; inventory deletion should be handled by caller/hook
      if (!transactionProvided) await t.commit();
    } catch (err) {
      if (!transactionProvided) await t.rollback();
      throw err;
    }
  });

  ProductCombination.addHook("afterDestroy", async (combo, options) => {
    const { Inventory } = sequelize.models;
    await Inventory.destroy({
      where: { combinationId: combo.id },
      transaction: options.transaction,
    });
  });

  return ProductCombination;
};
