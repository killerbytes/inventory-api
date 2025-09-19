"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "deletedAt");
    await queryInterface.removeColumn("StockAdjustments", "deletedAt");

    // await queryInterface.addIndex("Customers", ["deletedAt"]);
    await queryInterface.addColumn("GoodReceipts", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("GoodReceipts", ["deletedAt"]);
    await queryInterface.addColumn("GoodReceiptLines", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("GoodReceiptLines", ["deletedAt"]);
    // await queryInterface.addIndex("Inventories", ["deletedAt"]);
    await queryInterface.addColumn("Invoices", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("Invoices", ["deletedAt"]);
    await queryInterface.addColumn("InvoiceLines", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("InvoiceLines", ["deletedAt"]);
    await queryInterface.addColumn("Payments", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("Payments", ["deletedAt"]);
    await queryInterface.addColumn("PaymentApplications", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("PaymentApplications", ["deletedAt"]);
    // await queryInterface.addIndex("Products", ["deletedAt"]);
    // await queryInterface.addIndex("ProductCombinations", ["deletedAt"]);
    await queryInterface.addColumn("SalesOrders", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("SalesOrders", ["deletedAt"]);
    await queryInterface.addColumn("SalesOrderItems", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex("SalesOrderItems", ["deletedAt"]);
    // await queryInterface.addIndex("Suppliers", ["deletedAt"]);
    // await queryInterface.addIndex("Users", ["deletedAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Categories", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("StockAdjustments", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.removeIndex("Customers", "deletedAt");
    await queryInterface.removeColumn("GoodReceipts", "deletedAt");
    await queryInterface.removeIndex("GoodReceipts", "deletedAt");
    await queryInterface.removeColumn("GoodReceiptLines", "deletedAt");
    await queryInterface.removeIndex("GoodReceiptLines", "deletedAt");
    await queryInterface.removeIndex("Inventories", "deletedAt");
    await queryInterface.removeColumn("Invoices", "deletedAt");
    await queryInterface.removeIndex("Invoices", "deletedAt");
    await queryInterface.removeColumn("InvoiceLines", "deletedAt");
    await queryInterface.removeIndex("InvoiceLines", "deletedAt");
    await queryInterface.removeColumn("Payments", "deletedAt");
    await queryInterface.removeIndex("Payments", "deletedAt");
    await queryInterface.removeColumn("PaymentApplications", "deletedAt");
    await queryInterface.removeIndex("PaymentApplications", "deletedAt");
    await queryInterface.removeIndex("Products", "deletedAt");
    await queryInterface.removeIndex("ProductCombinations", "deletedAt");
    await queryInterface.removeColumn("SalesOrders", "deletedAt");
    await queryInterface.removeIndex("SalesOrders", "deletedAt");
    await queryInterface.removeColumn("SalesOrderItems", "deletedAt");
    await queryInterface.removeIndex("SalesOrderItems", "deletedAt");
    await queryInterface.removeIndex("Suppliers", "deletedAt");
    await queryInterface.removeIndex("Users", "deletedAt");
  },
};
