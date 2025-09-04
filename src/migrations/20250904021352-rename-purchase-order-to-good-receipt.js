"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    await queryInterface.renameTable("PurchaseOrders", "GoodReceipts");
    await queryInterface.renameColumn("GoodReceipts", "notes", "referenceNo");
    await queryInterface.renameColumn(
      "GoodReceipts",
      "deliveryDate",
      "receiptDate"
    );
    await queryInterface.renameColumn(
      "OrderStatusHistories",
      "purchaseOrderId",
      "goodReceiptId"
    );

    await queryInterface.removeColumn("GoodReceipts", "purchaseOrderNumber");
    await queryInterface.removeColumn("GoodReceipts", "modeOfPayment");
    await queryInterface.removeColumn("GoodReceipts", "checkNumber");
    await queryInterface.removeColumn("GoodReceipts", "dueDate");
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("GoodReceipts")) {
      await queryInterface.renameColumn("GoodReceipts", "referenceNo", "notes");
      await queryInterface.renameColumn(
        "GoodReceipts",
        "receiptDate",
        "deliveryDate"
      );

      await queryInterface.renameColumn(
        "OrderStatusHistories",
        "goodReceiptId",
        "purchaseOrderId"
      );
      await queryInterface.addColumn("GoodReceipts", "purchaseOrderNumber", {
        type: Sequelize.STRING,
        unique: true,
      });
      await queryInterface.addColumn("GoodReceipts", "modeOfPayment", {
        type: Sequelize.STRING,
        field: "modeOfPayment",
      });
      await queryInterface.addColumn("GoodReceipts", "checkNumber", {
        type: Sequelize.STRING,
        unique: true,
      });
      await queryInterface.addColumn("GoodReceipts", "dueDate", {
        type: Sequelize.DATE,
        field: "dueDate",
      });
      await queryInterface.renameTable("GoodReceipts", "PurchaseOrders");
    }
  },
};
