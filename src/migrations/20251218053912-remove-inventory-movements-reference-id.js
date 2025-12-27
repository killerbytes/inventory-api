"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const fkList = await queryInterface.getForeignKeyReferencesForTable(
      "InventoryMovements"
    );

    const hasConstraint = fkList.some(
      (fk) => fk.constraintName === "InventoryMovements_referenceId_fkey"
    );

    if (hasConstraint) {
      await queryInterface.removeConstraint(
        "InventoryMovements",
        "InventoryMovements_referenceId_fkey"
      );
    }
  },

  async down(queryInterface) {
    const fkList = await queryInterface.getForeignKeyReferencesForTable(
      "InventoryMovements"
    );

    const hasConstraint = fkList.some(
      (fk) => fk.constraintName === "InventoryMovements_referenceId_fkey"
    );

    if (!hasConstraint) {
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
    }
  },
};
