"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // or SET NULL if you allow supplier deletion
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      invoiceDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "DRAFT",
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      changedBy: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
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
    await queryInterface.createTable("InvoiceLines", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Invoices", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      goodReceiptId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "GoodReceipts", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // or SET NULL if you allow supplier deletion
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.createTable("Payments", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // or SET NULL if you allow supplier deletion
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      referenceNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      changedBy: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
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
    await queryInterface.createTable("PaymentApplications", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Payments", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // or SET NULL if you allow supplier deletion
      },
      invoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Invoices", // must exist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // or SET NULL if you allow supplier deletion
      },
      amountApplied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      amountRemaining: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable("PaymentApplications");
    await queryInterface.dropTable("Payments");
    await queryInterface.dropTable("InvoiceLines");
    await queryInterface.dropTable("Invoices");
  },
};
