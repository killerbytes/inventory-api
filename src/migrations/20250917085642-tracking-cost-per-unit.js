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
    await queryInterface.addColumn("InventoryMovements", "totalCost", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("InventoryMovements", "referenceType", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // await queryInterface.removeColumn("InventoryMovements", "sellingPrice");
    await queryInterface.removeColumn("InventoryMovements", "previous");
    await queryInterface.removeColumn("InventoryMovements", "new");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Inventories", "averagePrice");
    await queryInterface.removeColumn("InventoryMovements", "costPerUnit");
    await queryInterface.removeColumn("InventoryMovements", "totalCost");
    await queryInterface.removeColumn("InventoryMovements", "referenceType");
    // await queryInterface.addColumn("InventoryMovements", "sellingPrice", {
    //   type: Sequelize.DECIMAL(10, 2),
    //   allowNull: true,
    // });
    await queryInterface.addColumn("InventoryMovements", "previous", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("InventoryMovements", "new", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
