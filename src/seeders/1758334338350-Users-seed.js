"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: 1,
          name: "Admin",
          username: "admin",
          email: "admin@email.com",
          password:
            "$2b$08$BwRhRpz6W97nfUICpyWP2OWBvOlaTYgfy/xtuR.In3BbBii.T9WRy",
          isActive: true,
          isAdmin: false,
          createdAt: "2025-09-20T02:12:18.350Z",
          updatedAt: "2025-09-20T02:12:18.350Z",
        },
        {
          id: 2,
          name: "Joel Carlos",
          username: "killerbytes",
          email: "joelcarlos02@gmail.com",
          password:
            "$2b$08$IMqjhjcqkTdl4vh/8zF1reYBIdCyJ0wUsejvLBk4yZJqhWPBuf3yS",
          isActive: true,
          isAdmin: false,
          createdAt: "2025-09-20T02:12:18.350Z",
          updatedAt: "2025-09-20T02:12:18.350Z",
        },
      ],
      {}
    );

    await queryInterface.sequelize.query(`
  SELECT setval(
    pg_get_serial_sequence('"Users"', 'id'),
    COALESCE((SELECT MAX("id") FROM "Users"), 0) + 1,
    false
  );
`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
