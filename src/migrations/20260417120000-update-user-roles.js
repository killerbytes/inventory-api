"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Add role column
      await queryInterface.addColumn(
        "Users",
        "role",
        {
          type: Sequelize.STRING,
          defaultValue: "User",
        },
        { transaction }
      );

      // 2. Map existing isAdmin to roles
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET "role" = 'Admin' WHERE "isAdmin" = true;`,
        { transaction }
      );

      // 3. Drop isAdmin column
      await queryInterface.removeColumn("Users", "isAdmin", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Re-add isAdmin
      await queryInterface.addColumn(
        "Users",
        "isAdmin",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction }
      );

      // 2. Map Admin roles back to isAdmin = true
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET "isAdmin" = true WHERE "role" = 'Admin';`,
        { transaction }
      );

      // 3. Drop role column
      await queryInterface.removeColumn("Users", "role", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
