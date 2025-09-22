"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Customers",
      [
        {
          id: 1,
          name: "Default",
          email: null,
          phone: null,
          address: "Cabanatuan City",
          notes: null,
          isActive: true,
          createdAt: "2025-09-20T02:12:18.357Z",
          updatedAt: "2025-09-20T02:12:18.357Z",
        },
      ],
      {}
    );

    await queryInterface.sequelize.query(`
  SELECT setval(
    pg_get_serial_sequence('"Customers"', 'id'),
    COALESCE((SELECT MAX("id") FROM "Customers"), 0) + 1,
    false
  );
`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Customers", null, {});
  },
};
