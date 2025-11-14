"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ReturnTransactions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sourceType: {
        //SalesOrder, GoodReceipt
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalReturnAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDifference: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        // Return, Replace, Exchange, Supplier Return
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("ReturnItems", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      returnTransactionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ReturnTransactions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      combinationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProductCombinations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ReturnItems");
    await queryInterface.dropTable("ReturnTransactions");
  },
};
