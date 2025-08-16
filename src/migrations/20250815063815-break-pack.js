"use strict";
const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("breakPacks", {
      fromCombinationId: {
        // the pack
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      toCombinationId: {
        // the singles
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        // how many packs broken
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      conversionFactor: {
        // singles per pack
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("BreakPacks");
    await queryInterface.dropTable("InventoryBreakPacks");
  },
};
