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
      defaultValue: "PCS",
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
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("Products", "baseUnit");
    await queryInterface.removeColumn("ProductCombinations", "unit");
    await queryInterface.removeColumn(
      "ProductCombinations",
      "conversionFactor"
    );
  },
};
