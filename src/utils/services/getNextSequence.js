const Sequelize = require("sequelize");

async function getNextSequence(name, sequelize) {
  const dialect = sequelize.getDialect();

  if (dialect === "postgres") {
    // Native sequence
    const [[{ nextval }]] = await sequelize.query(`SELECT nextval('${name}');`);
    return Number(nextval);
  }

  if (dialect === "sqlite") {
    // Fallback: emulate with Sequences table

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Sequences (
        name TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `);

    await sequelize.query(
      `
      INSERT INTO Sequences(name, value)
      VALUES(:name, 1)
      ON CONFLICT(name) DO UPDATE SET value = value + 1
      `,
      {
        replacements: { name },
        type: Sequelize.QueryTypes.INSERT,
      }
    );

    // Now fetch the latest value
    const [rows] = await sequelize.query(
      `SELECT value FROM Sequences WHERE name = :name`,
      {
        replacements: { name },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    return rows.value;
  }

  throw new Error(`Unsupported dialect: ${dialect}`);
}

module.exports = getNextSequence;
