"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stockAdjustments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      referenceNo: Sequelize.STRING,
      combinationId: Sequelize.INTEGER,
      systemQuantity: Sequelize.INTEGER,
      newQuantity: Sequelize.INTEGER,
      difference: Sequelize.INTEGER,
      reason: Sequelize.STRING,
      notes: Sequelize.STRING,
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        field: "createdAt",
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: "updatedAt",
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("stockAdjustments");
  },
};
