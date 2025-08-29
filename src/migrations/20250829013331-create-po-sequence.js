"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "postgres") {
      // ✅ Native Postgres sequence
      await queryInterface.sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS purchase_order_seq
        START 1
        INCREMENT 1
        MINVALUE 1
        NO MAXVALUE
        CACHE 1;
      `);
    } else if (dialect === "sqlite") {
      // ✅ Fallback: create a Sequences table if not exists
      await queryInterface.createTable("Sequences", {
        name: {
          type: Sequelize.STRING,
          primaryKey: true,
        },
        value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      });
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "postgres") {
      await queryInterface.sequelize.query(`
        DROP SEQUENCE IF EXISTS purchase_order_seq;
      `);
    } else if (dialect === "sqlite") {
      await queryInterface.dropTable("Sequences");
    }
  },
};
