"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("BreakPacks", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Backfill: Update BreakPacks.type by joining with InventoryMovements
    // We match by referenceId and referenceType
    await queryInterface.sequelize.query(`
      UPDATE "BreakPacks" bp
      SET "type" = im."type"
      FROM "InventoryMovements" im
      WHERE im."referenceId" = bp.id
      AND im."referenceType" = 'BREAK_PACK';
    `);

    // Secondary backfill for those using the old time-based logic (before referenceId was fixed)
    await queryInterface.sequelize.query(`
      UPDATE "BreakPacks" bp
      SET "type" = im."type"
      FROM "InventoryMovements" im
      WHERE bp."type" IS NULL
      AND im."combinationId" = bp."fromCombinationId"
      AND im.type IN ('BREAK_PACK', 'RE_PACK')
      AND ABS(EXTRACT(EPOCH FROM (im."createdAt" - bp."createdAt"))) < 5;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("BreakPacks", "type");
  },
};
