"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "SalesOrders",
      "deliveryDate",
      "orderDate"
    );

    await queryInterface.addColumn("SalesOrders", "deliveryDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("SalesOrders", "deliveryDate");
    await queryInterface.renameColumn(
      "SalesOrders",
      "orderDate",
      "deliveryDate"
    );
  },
};
