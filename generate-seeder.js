const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${env}` });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

async function generateSeeder(tableName) {
  // 1. Get schema info
  const [columns] = await sequelize.query(`
    SELECT column_name, is_identity, is_nullable
    FROM information_schema.columns
    WHERE table_name = '${tableName}'
  `);

  // 2. Figure out valid columns
  const validColumns = columns
    .map((c) => c.column_name)
    .filter(
      (col) =>
        !["deletedAt", "categorySnapshot", "variantSnapshot"].includes(col) // skip IDs + paranoid
    );

  // 3. Get actual data
  const [results] = await sequelize.query(`SELECT * FROM "${tableName}"`);

  // 4. Clean rows
  const cleaned = results.map((row) => {
    const obj = {};
    validColumns.forEach((col) => {
      if (col === "createdAt" || col === "updatedAt") {
        obj[col] = new Date(); // always set timestamps
      } else {
        obj[col] = row[col] === null ? null : row[col];
      }
    });
    return obj;
  });

  // 5. Write seeder
  const timestamp = Date.now();
  const fileName = `${timestamp}-${tableName}-seed.js`;

  const seederContent = `
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("${tableName}", ${JSON.stringify(
    cleaned,
    null,
    2
  )}, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("${tableName}", null, {});
  }
};
`;

  const filePath = path.join(__dirname, "src", "seeders", fileName);
  fs.writeFileSync(filePath, seederContent);
  console.log(`✅ Seeder generated: ${fileName}`);
}

(async () => {
  try {
    // Example: generate for multiple tables
    await generateSeeder("Categories");
    await generateSeeder("Suppliers");
    await generateSeeder("Users");
    await generateSeeder("Customers");
    await generateSeeder("Products");
    await generateSeeder("VariantTypes");
    await generateSeeder("VariantValues");
    await generateSeeder("ProductCombinations");
    await generateSeeder("CombinationValues");
    await generateSeeder("Inventories");
    await generateSeeder("GoodReceipts");
    await generateSeeder("GoodReceiptLines");
    await generateSeeder("OrderStatusHistories");

    await sequelize.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
