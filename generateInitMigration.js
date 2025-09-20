/**
 * generateInitMigration.js
 *
 * Generates a Sequelize "init-schema" migration by introspecting the database,
 * including foreign keys & indexes, and orders tables correctly.
 *
 * Run with:
 *   node generateInitMigration.js
 */

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
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres", // change if mysql/sqlite/mssql
    logging: false,
  }
);

async function generateMigration() {
  try {
    const qi = sequelize.getQueryInterface();
    const tablesRaw = await qi.showAllTables();
    const tables = tablesRaw.map((t) =>
      typeof t === "object" ? t.tableName : t
    );

    // Gather dependencies (FKs)
    let deps = {};
    let fkMap = {};

    for (const table of tables) {
      const fks = await getForeignKeys(table);
      deps[table] = fks.map((fk) => fk.referencedTable);
      fkMap[table] = fks;
    }

    // Topologically sort tables by dependencies
    const sortedTables = topoSort(tables, deps);

    let upQueries = [];
    let downQueries = [];

    for (const table of sortedTables) {
      const desc = await qi.describeTable(table);

      // Columns
      let cols = [];
      for (const [colName, colDef] of Object.entries(desc)) {
        let colLine = `${colName}: { type: Sequelize.${mapType(
          colDef.type
        )}, allowNull: ${colDef.allowNull}`;
        // Handle auto-increment (Postgres serial/identity)
        const defVal = colDef.defaultValue
          ? colDef.defaultValue.toString()
          : null;

        if (defVal && defVal.startsWith("nextval(")) {
          // Postgres SERIAL/IDENTITY -> autoIncrement
          colLine += `, autoIncrement: true`;
        } else if (colDef.defaultValue !== null) {
          colLine += `, defaultValue: ${JSON.stringify(colDef.defaultValue)}`;
        }

        if (colDef.primaryKey) colLine += `, primaryKey: true`;

        colLine += " }";
        cols.push(colLine);
      }

      // Build createTable
      upQueries.push(`
      await queryInterface.createTable("${table}", {
        ${cols.join(",\n        ")}
      });
      `);

      // Add FKs
      for (const fk of fkMap[table]) {
        upQueries.push(`
      await queryInterface.addConstraint("${table}", {
        fields: ["${fk.column}"],
        type: "foreign key",
        name: "${fk.constraintName}",
        references: { table: "${fk.referencedTable}", field: "${
          fk.referencedColumn
        }" },
        onUpdate: "${fk.onUpdate || "CASCADE"}",
        onDelete: "${fk.onDelete || "SET NULL"}"
      });`);
      }

      // Add indexes
      const indexes = await qi.showIndex(table);
      for (const i of indexes) {
        if (i.primary) continue;
        upQueries.push(`
      await queryInterface.addIndex("${table}", {
        name: "${i.name}",
        unique: ${i.unique},
        fields: [${i.fields.map((f) => `"${f.attribute}"`).join(", ")}]
      });`);
      }
    }

    // Drop in reverse order
    for (const table of [...sortedTables].reverse()) {
      downQueries.push(`await queryInterface.dropTable("${table}");`);
    }

    const migrationTemplate = `"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    ${upQueries.join("\n    ")}
  },

  async down(queryInterface, Sequelize) {
    ${downQueries.join("\n    ")}
  },
};
`;

    const filePath = path.join(
      __dirname,
      "src",
      "migrations",
      `${Date.now()}-init-schema.js`
    );

    fs.writeFileSync(filePath, migrationTemplate);
    console.log(`✅ Migration written to ${filePath}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error generating migration:", err);
    process.exit(1);
  }
}

/**
 * Simple type mapping
 */
function mapType(sqlType) {
  const t = sqlType.toLowerCase();
  if (t.includes("int")) return "INTEGER";
  if (t.includes("bigint")) return "BIGINT";
  if (t.includes("uuid")) return "UUID";
  if (t.includes("varchar") || t.includes("char")) return "STRING";
  if (t.includes("text")) return "TEXT";
  if (t.includes("bool")) return "BOOLEAN";
  if (t.includes("date")) return "DATE";
  if (t.includes("decimal") || t.includes("numeric")) return "DECIMAL";
  if (t.includes("json")) return "JSON";
  return "STRING";
}

/**
 * Get foreign key constraints
 */
async function getForeignKeys(table) {
  let sql;
  if (sequelize.getDialect() === "postgres") {
    sql = `
      SELECT
        tc.constraint_name AS "constraintName",
        kcu.column_name AS "column",
        ccu.table_name AS "referencedTable",
        ccu.column_name AS "referencedColumn",
        rc.update_rule AS "onUpdate",
        rc.delete_rule AS "onDelete"
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${table}';
    `;
  } else if (sequelize.getDialect() === "mysql") {
    sql = `
      SELECT
        kcu.constraint_name AS "constraintName",
        kcu.column_name AS "column",
        kcu.referenced_table_name AS "referencedTable",
        kcu.referenced_column_name AS "referencedColumn",
        rc.update_rule AS "onUpdate",
        rc.delete_rule AS "onDelete"
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.referential_constraints rc
        ON kcu.constraint_name = rc.constraint_name
      WHERE kcu.table_name='${table}' AND kcu.table_schema=DATABASE();
    `;
  } else {
    return [];
  }

  const [results] = await sequelize.query(sql);
  return results;
}

/**
 * Topological sort to order tables by dependencies
 */
function topoSort(nodes, edges) {
  let sorted = [];
  let visited = {};

  function visit(n, stack = []) {
    if (visited[n] === true) return;
    if (visited[n] === "in-progress")
      throw new Error(
        `Cyclic dependency detected: ${[...stack, n].join(" -> ")}`
      );

    visited[n] = "in-progress";
    (edges[n] || []).forEach((m) => {
      if (m === n) return; // ignore self-FK
      visit(m, [...stack, n]);
    });
    visited[n] = true;
    sorted.push(n);
  }

  nodes.forEach((n) => visit(n));
  return sorted;
}

generateMigration();
