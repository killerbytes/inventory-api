"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PriceHistories", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: { type: Sequelize.INTEGER, allowNull: false },
      combinationId: { type: Sequelize.INTEGER },
      fromPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      toPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      changedBy: { type: Sequelize.INTEGER, allowNull: false },
      changedAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PriceHistories");
  },
};
