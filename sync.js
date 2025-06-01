// sync.js
const { exit } = require("process");
const db = require("./models");
const { sequelize } = db;

(async () => {
  try {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await db.sequelize.sync({
      force: true,
      omitNested: true, // This skips foreign key constraints
    }); // recreate tables

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Run all seeders
    const { exec } = require("child_process");
    exec("npx sequelize-cli db:seed:all --debug", (error, stdout, stderr) => {
      if (error) {
        console.error(`Seeding error: ${error}`);
        return;
      }
      console.log("Database seeded successfully");
      exit(0);
    });

    console.log("✅ Synced");
  } catch (error) {
    console.error("Database reset failed:", error);
  }
})();
