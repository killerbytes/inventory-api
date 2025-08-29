"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop the old unique constraint/index on `sku`
    await queryInterface
      .removeConstraint("ProductCombinations", "ProductCombinations_sku_key")
      .catch(() => {}); // ignore if it doesn't exist

    // 2. Add a new partial unique index (only where deletedAt IS NULL)
    await queryInterface.addIndex("ProductCombinations", ["sku"], {
      name: "unique_active_sku",
      unique: true,
      where: {
        deletedAt: {
          [Sequelize.Op.is]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove partial unique index
    await queryInterface.removeIndex(
      "ProductCombinations",
      "unique_active_sku"
    );

    // // Restore original unique constraint on sku
    // await queryInterface.addConstraint("ProductCombinations", {
    //   fields: ["sku"],
    //   type: "unique",
    //   name: "ProductCombinations_sku_key",
    // });
  },
};
