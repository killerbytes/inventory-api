"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Inventories", "averagePrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("InventoryMovements", "costPerUnit", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("InventoryMovements", "sellingPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Inventories", "averagePrice");
    await queryInterface.removeColumn("InventoryMovements", "costPerUnit");
    await queryInterface.removeColumn("InventoryMovements", "sellingPrice");
  },
};
