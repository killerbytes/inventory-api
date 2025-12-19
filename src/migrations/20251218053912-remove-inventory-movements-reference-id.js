"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint(
      "InventoryMovements",
      "InventoryMovements_referenceId_fkey"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint("InventoryMovements", {
      fields: ["referenceId"],
      type: "foreign key",
      name: "InventoryMovements_referenceId_fkey",
      references: {
        table: "StockAdjustments",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
