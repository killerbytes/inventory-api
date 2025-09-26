"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductCombinations", "isBreakPack", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("ProductCombinations", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductCombinations", "isBreakPack");
    await queryInterface.removeColumn("ProductCombinations", "isActive");
  },
};
