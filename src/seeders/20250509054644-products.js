"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Insert Product
      const [productId] = await queryInterface
        .bulkInsert(
          "Products",
          [
            {
              name: "T-Shirt",
              description: "Cotton T-Shirt",
              unit: "BOX",
              categoryId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction, returning: ["id"] }
        )
        .then((ids) => [ids[0]?.id || ids]);

      // Insert VariantTypes
      const variantTypes = [
        {
          name: "Size",
          productId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Color",
          productId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const variantTypeRows = await queryInterface.bulkInsert(
        "VariantTypes",
        variantTypes,
        { transaction, returning: true }
      );

      const sizeTypeId = variantTypeRows[0]?.id || 1;
      const colorTypeId = variantTypeRows[1]?.id || 2;

      // Insert VariantValues
      const sizeValues = ["S", "M"];
      const colorValues = ["Red", "Blue"];

      const variantValues = [];

      for (const val of sizeValues) {
        variantValues.push({
          value: val,
          variantTypeId: sizeTypeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      for (const val of colorValues) {
        variantValues.push({
          value: val,
          variantTypeId: colorTypeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await queryInterface.bulkInsert("VariantValues", variantValues, {
        transaction,
        returning: true,
      });
      const insertedValues = await queryInterface.sequelize.query(
        `SELECT id, value, variantTypeId FROM VariantValues WHERE variantTypeId IN (${colorTypeId}, ${sizeTypeId});`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const sizeMap = {};
      const colorMap = {};

      for (const val of insertedValues) {
        if (val.variantTypeId === sizeTypeId) sizeMap[val.value] = val.id;
        if (val.variantTypeId === colorTypeId) colorMap[val.value] = val.id;
      }

      // Insert ProductCombinations and Inventory
      const combinations = [
        { sku: "TS-S-R", size: "S", color: "Red", price: 100, quantity: 10 },
        { sku: "TS-S-B", size: "S", color: "Blue", price: 120, quantity: 0 },
        { sku: "TS-M-R", size: "M", color: "Red", price: 80, quantity: 0 },
        { sku: "TS-M-B", size: "M", color: "Blue", price: 50, quantity: 5 },
      ];
      console.log(combinations);

      for (const combo of combinations) {
        const [comboId] = await queryInterface
          .bulkInsert(
            "ProductCombinations",
            [
              {
                productId,
                price: combo.price,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            { transaction, returning: ["id"] }
          )
          .then((ids) => [ids[0]?.id || ids]);

        await queryInterface.bulkInsert(
          "CombinationValues",
          [
            {
              combinationId: comboId,
              variantValueId: sizeMap[combo.size],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              combinationId: comboId,
              variantValueId: colorMap[combo.color],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );

        await queryInterface.bulkInsert(
          "Inventories",
          [
            {
              combinationId: comboId,
              quantity: combo.quantity,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Inventories", null, {});
    await queryInterface.bulkDelete("CombinationValues", null, {});
    await queryInterface.bulkDelete("ProductCombinations", null, {});
    await queryInterface.bulkDelete("VariantValues", null, {});
    await queryInterface.bulkDelete("VariantTypes", null, {});
    await queryInterface.bulkDelete("Products", null, {});
  },
};
