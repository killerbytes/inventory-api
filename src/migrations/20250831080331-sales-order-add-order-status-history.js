"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("SalesOrders", "orderDate");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("SalesOrders", "orderDate", {
      type: Sequelize.DATE,
    });
  },
};
