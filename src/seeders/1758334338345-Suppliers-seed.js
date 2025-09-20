("use strict");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Suppliers",
      [
        {
          id: 1,
          name: "Supertop Trading Inc.",
          contact: "Carl Brian",
          email: null,
          phone: "7975-7879\n7964-5162\n7211-5405\n7577-2451\n(PLDT) 8289-8603",
          address: "81 Judge Juan Luna St. San Antonio, Quezon City",
          notes: null,
          isActive: true,
          createdAt: "2025-09-20T02:12:18.345Z",
          updatedAt: "2025-09-20T02:12:18.345Z",
        },
      ],
      {}
    );

    await queryInterface.sequelize.query(`
  SELECT setval(
    pg_get_serial_sequence('"Suppliers"', 'id'),
    COALESCE((SELECT MAX("id") FROM "Suppliers"), 0) + 1,
    false
  );
`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Suppliers", null, {});
  },
};
