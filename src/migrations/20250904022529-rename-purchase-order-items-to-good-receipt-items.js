"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("PurchaseOrderItems")) {
      await queryInterface.renameTable(
        "PurchaseOrderItems",
        "GoodReceiptLines"
      );
      await queryInterface.renameColumn(
        "GoodReceiptLines",
        "purchaseOrderId",
        "goodReceiptId"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("GoodReceiptLines")) {
      await queryInterface.renameColumn(
        "GoodReceiptLines",
        "goodReceiptId",
        "purchaseOrderId"
      );
      await queryInterface.renameTable(
        "GoodReceiptLines",
        "PurchaseOrderItems"
      );
    }
  },
};
