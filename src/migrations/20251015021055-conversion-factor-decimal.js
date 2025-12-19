"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    ALTER TABLE "ProductCombinations"
    ALTER COLUMN "conversionFactor"
    TYPE NUMERIC(18,6)
    USING "conversionFactor"::NUMERIC;
  `);

    await queryInterface.sequelize.query(`
    ALTER TABLE "BreakPacks"
    ALTER COLUMN "conversionFactor"
    TYPE NUMERIC(18,6)
    USING "conversionFactor"::NUMERIC;
  `);
    // await queryInterface.changeColumn(
    //   "ProductCombinations",
    //   "conversionFactor",
    //   {
    //     type: Sequelize.DECIMAL(18, 6),
    //     allowNull: true,
    //   }
    // );

    // await queryInterface.changeColumn("BreakPacks", "conversionFactor", {
    //   type: Sequelize.DECIMAL(18, 6),
    //   allowNull: true,
    // });

    await queryInterface.changeColumn("BreakPacks", "quantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: true,
    });

    await queryInterface.changeColumn("Inventories", "quantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("InventoryMovements", "quantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("GoodReceiptLines", "quantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("SalesOrderItems", "quantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("StockAdjustments", "systemQuantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("StockAdjustments", "newQuantity", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("StockAdjustments", "difference", {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("ProductCombinations", "isBreakPackOfId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ProductCombinations",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.dropTable("InventoryBreakPacks");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "ProductCombinations",
      "conversionFactor",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );

    await queryInterface.changeColumn("BreakPacks", "conversionFactor", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("BreakPacks", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("Inventories", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("InventoryMovements", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("GoodReceiptLines", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("SalesOrderItems", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("StockAdjustments", "systemQuantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("StockAdjustments", "newQuantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("StockAdjustments", "difference", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.removeColumn("ProductCombinations", "isBreakPackOfId");

    await queryInterface.createTable("InventoryBreakPacks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fromCombinationId: { type: Sequelize.INTEGER, allowNull: false },
      toCombinationId: { type: Sequelize.INTEGER, allowNull: false },
      fromQuantity: { type: Sequelize.INTEGER, allowNull: false },
      toQuantity: { type: Sequelize.INTEGER, allowNull: false },
      reason: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.STRING, allowNull: false },
      updatedAt: { type: Sequelize.STRING, allowNull: false },
    });
  },
};
