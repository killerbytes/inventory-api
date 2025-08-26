"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "unit");
    await queryInterface.removeColumn("Products", "conversionFactor");

    await queryInterface.addColumn("Products", "baseUnit", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "PCS",
    });

    await queryInterface.addColumn("ProductCombinations", "unit", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("ProductCombinations", "sku", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addConstraint("ProductCombinations", {
      fields: ["sku"],
      type: "unique",
      name: "unique_sku_per_product_combination", // custom name
    });

    await queryInterface.addColumn("ProductCombinations", "conversionFactor", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "unit", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Products", "conversionFactor", {
      type: Sequelize.STRING, // ⚠️ use original type if not STRING
      allowNull: false,
    });

    await queryInterface.removeColumn("Products", "baseUnit");
    await queryInterface.removeColumn("ProductCombinations", "unit");

    // Drop constraint BEFORE removing sku
    await queryInterface.removeConstraint(
      "ProductCombinations",
      "unique_sku_per_product_combination"
    );

    await queryInterface.changeColumn("ProductCombinations", "sku", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn(
      "ProductCombinations",
      "conversionFactor"
    );
  },
};
