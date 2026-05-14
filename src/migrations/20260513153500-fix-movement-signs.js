"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Rename and flip signs for OUT and SUPPLIER_RETURN
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET 
        "quantity" = -ABS("quantity"),
        "totalCost" = -ABS("totalCost"),
        "type" = 'SUPPLIER_RETURN_OUT'
      WHERE "type" IN ('SUPPLIER_RETURN', 'SUPPLIER_RETURN_OUT');
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET 
        "quantity" = -ABS("quantity"),
        "totalCost" = -ABS("totalCost")
      WHERE "type" = 'OUT';
    `);

    // 2. Fix ADJUSTMENTS using the StockAdjustments audit table
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements" im
      SET 
        "quantity" = -ABS(im."quantity"),
        "totalCost" = -ABS(im."totalCost"),
        "type" = 'ADJUSTMENT_OUT'
      FROM "StockAdjustments" sa
      WHERE im."referenceId" = sa.id
      AND im."type" IN ('ADJUSTMENT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT')
      AND sa.difference < 0;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements" im
      SET 
        "quantity" = ABS(im."quantity"),
        "totalCost" = ABS(im."totalCost"),
        "type" = 'ADJUSTMENT_IN'
      FROM "StockAdjustments" sa
      WHERE im."referenceId" = sa.id
      AND im."type" IN ('ADJUSTMENT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT')
      AND sa.difference >= 0;
    `);

    // 3. Fix EXCHANGE and RETURN pairs
    
    // 3a. Rename EXCHANGE to EXCHANGE_OUT and flip sign
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET 
        "quantity" = -ABS("quantity"),
        "totalCost" = -ABS("totalCost"),
        "type" = 'EXCHANGE_OUT'
      WHERE "type" IN ('EXCHANGE', 'EXCHANGE_OUT');
    `);

    // 3b. Find RETURN records that were part of an EXCHANGE
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements" im_in
      SET 
        "type" = 'EXCHANGE_IN',
        "quantity" = ABS(im_in."quantity"),
        "totalCost" = ABS(im_in."totalCost")
      FROM "InventoryMovements" im_out
      WHERE im_in."referenceId" = im_out."referenceId"
      AND im_in."type" IN ('RETURN', 'RETURN_IN', 'EXCHANGE_IN')
      AND im_out."type" = 'EXCHANGE_OUT'
      AND ABS(EXTRACT(EPOCH FROM (im_in."createdAt" - im_out."createdAt"))) < 1;
    `);

    // 3c. Rename remaining RETURN to RETURN_IN
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET 
        "type" = 'RETURN_IN',
        "quantity" = ABS("quantity"),
        "totalCost" = ABS("totalCost")
      WHERE "type" IN ('RETURN', 'RETURN_IN');
    `);

    // 4. Fix BREAK_PACK and RE_PACK using the Sequential Pair heuristic
    
    // 4a. Update the SOURCE (Decrease) - Flip sign and rename to _OUT
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements" im1
      SET 
        "quantity" = -ABS(im1."quantity"),
        "totalCost" = -ABS(im1."totalCost"),
        "type" = CASE 
                    WHEN im1."type" IN ('BREAK_PACK', 'BREAK_PACK_OUT') THEN 'BREAK_PACK_OUT'
                    WHEN im1."type" IN ('RE_PACK', 'RE_PACK_OUT') THEN 'RE_PACK_OUT'
                    ELSE im1."type"
                 END
      FROM "InventoryMovements" im2
      WHERE im1.id = im2.id - 1
      AND im1.type IN ('BREAK_PACK', 'RE_PACK', 'BREAK_PACK_OUT', 'RE_PACK_OUT')
      AND im2.type IN ('BREAK_PACK', 'RE_PACK', 'BREAK_PACK_IN', 'RE_PACK_IN')
      AND ABS(EXTRACT(EPOCH FROM (im1."createdAt" - im2."createdAt"))) < 0.2;
    `);

    // 4b. Update the TARGET (Increase) - Keep sign positive and rename to _IN
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements" im2
      SET 
        "type" = CASE 
                    WHEN im2."type" IN ('BREAK_PACK', 'BREAK_PACK_IN') THEN 'BREAK_PACK_IN'
                    WHEN im2."type" IN ('RE_PACK', 'RE_PACK_IN') THEN 'RE_PACK_IN'
                    ELSE im2."type"
                 END
      FROM "InventoryMovements" im1
      WHERE im2.id = im1.id + 1
      AND im2.type IN ('BREAK_PACK', 'RE_PACK', 'BREAK_PACK_IN', 'RE_PACK_IN')
      AND im1.type IN ('BREAK_PACK_OUT', 'RE_PACK_OUT')
      AND ABS(EXTRACT(EPOCH FROM (im1."createdAt" - im2."createdAt"))) < 0.2;
    `);

    // 5. Final cleanup: Any remaining positive BREAK_PACK/RE_PACK
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET "type" = CASE 
                    WHEN "type" IN ('BREAK_PACK', 'BREAK_PACK_IN') THEN 'BREAK_PACK_IN'
                    WHEN "type" IN ('RE_PACK', 'RE_PACK_IN') THEN 'RE_PACK_IN'
                    ELSE "type"
                 END
      WHERE "type" IN ('BREAK_PACK', 'RE_PACK');
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "InventoryMovements"
      SET 
        "quantity" = ABS("quantity"),
        "totalCost" = ABS("totalCost"),
        "type" = CASE 
                    WHEN "type" LIKE 'BREAK_PACK_%' THEN 'BREAK_PACK'
                    WHEN "type" LIKE 'RE_PACK_%' THEN 'RE_PACK'
                    WHEN "type" LIKE 'ADJUSTMENT_%' THEN 'ADJUSTMENT'
                    WHEN "type" LIKE 'EXCHANGE_%' THEN 'EXCHANGE'
                    WHEN "type" = 'RETURN_IN' THEN 'RETURN'
                    WHEN "type" = 'SUPPLIER_RETURN_OUT' THEN 'SUPPLIER_RETURN'
                    ELSE "type"
                 END;
    `);
  },
};
