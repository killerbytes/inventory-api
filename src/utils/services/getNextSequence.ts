const Sequelize = require("sequelize");

export async function getNextSequence(name, sequelize) {
  const dialect = sequelize.getDialect();

  if (dialect === "postgres") {
    // Native sequence
    const [[{ nextval }]] = await sequelize.query(`SELECT nextval('${name}');`);
    return Number(nextval);
  }

  if (dialect === "sqlite") {
    // Fallback: emulate with Sequences table
    const [row] = await sequelize.query(
      `
      INSERT INTO Sequences(name, value)
      VALUES(:name, 1)
      ON CONFLICT(name) DO UPDATE SET value = value + 1
      RETURNING value;
      `,
      {
        replacements: { name },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    return row.value;
  }

  throw new Error(`Unsupported dialect: ${dialect}`);
}
