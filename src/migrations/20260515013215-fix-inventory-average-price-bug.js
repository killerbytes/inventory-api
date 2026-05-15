'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [combinations] = await queryInterface.sequelize.query(
        `SELECT DISTINCT "combinationId" FROM "Inventories" WHERE "deletedAt" IS NULL;`,
        { transaction }
      );

      for (const { combinationId } of combinations) {
        const [movements] = await queryInterface.sequelize.query(
          `SELECT id, type, quantity, "costPerUnit" 
           FROM "InventoryMovements" 
           WHERE "combinationId" = :combinationId
           ORDER BY "createdAt" ASC, id ASC;`,
          {
            replacements: { combinationId },
            transaction,
          }
        );

        let currentQty = 0;
        let currentAvgCost = 0;
        let updates = [];

        for (const movement of movements) {
          const qty = parseFloat(movement.quantity);
          const cost = parseFloat(movement.costPerUnit || 0);

          if (
            movement.type === 'IN' ||
            movement.type === 'BREAK_PACK_IN' ||
            movement.type === 'RE_PACK_IN'
          ) {
            const newQty = currentQty + qty;
            if (newQty > 0) {
              currentAvgCost = (currentQty * currentAvgCost + qty * cost) / newQty;
            } else {
              currentAvgCost = cost;
            }
            currentQty = newQty;
          } else {
            if (Math.abs(cost - currentAvgCost) > 0.01 && currentAvgCost > 0) {
              updates.push({
                id: movement.id,
                costPerUnit: currentAvgCost,
                totalCost: currentAvgCost * qty,
              });
            }
            currentQty += qty;
          }
        }

        for (const update of updates) {
          await queryInterface.sequelize.query(
            `UPDATE "InventoryMovements" 
             SET "costPerUnit" = :costPerUnit, "totalCost" = :totalCost 
             WHERE id = :id;`,
            {
              replacements: update,
              transaction,
            }
          );
        }

        const [inventoryResult] = await queryInterface.sequelize.query(
          `SELECT id, "averagePrice" FROM "Inventories" WHERE "combinationId" = :combinationId AND "deletedAt" IS NULL;`,
          { replacements: { combinationId }, transaction }
        );

        if (inventoryResult.length > 0) {
          const invAvgPrice = parseFloat(inventoryResult[0].averagePrice || 0);
          if (Math.abs(invAvgPrice - currentAvgCost) > 0.01) {
            await queryInterface.sequelize.query(
              `UPDATE "Inventories" SET "averagePrice" = :currentAvgCost WHERE id = :id;`,
              {
                replacements: {
                  currentAvgCost,
                  id: inventoryResult[0].id,
                },
                transaction,
              }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverting this migration is not possible as we overwrite corrupted data.
  }
};
