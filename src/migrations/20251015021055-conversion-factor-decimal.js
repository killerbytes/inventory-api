"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "ProductCombinations",
      "conversionFactor",
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }
    );

    await queryInterface.changeColumn("BreakPacks", "conversionFactor", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "ProductCombinations",
      "conversionFactor",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn("BreakPacks", "conversionFactor", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
