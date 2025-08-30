"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const variantTypesData = [
      {
        id: 16,
        name: "NAIL_SIZES",
        isTemplate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          { id: 34, value: '1/4"', variantTypeId: 16 },
          { id: 35, value: '1/2"', variantTypeId: 16 },
          { id: 36, value: '3/8"', variantTypeId: 16 },
          { id: 37, value: '1"', variantTypeId: 16 },
          { id: 45, value: '4"', variantTypeId: 16 },
        ],
      },
      {
        id: 17,
        name: "PAINT_COLORS",
        isTemplate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          { id: 38, value: "Yellow 1", variantTypeId: 17 },
          { id: 39, value: "Violet 2", variantTypeId: 17 },
          { id: 40, value: "White 3", variantTypeId: 17 },
          { id: 41, value: "Black 4", variantTypeId: 17 },
        ],
      },
      {
        id: 18,
        name: "PAINT_SIZES",
        isTemplate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          { id: 42, value: "1 Gallon", variantTypeId: 18 },
          { id: 43, value: "1 Liter", variantTypeId: 18 },
          { id: 44, value: "1/2 Liter", variantTypeId: 18 },
        ],
      },
    ];

    const variantValues = [];

    // flatten the values and add timestamps
    for (const type of variantTypesData) {
      for (const val of type.values) {
        variantValues.push({
          id: val.id,
          value: val.value,
          variantTypeId: val.variantTypeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // insert VariantTypes
    await queryInterface.bulkInsert(
      "VariantTypes",
      variantTypesData.map(({ values, ...rest }) => rest)
    );

    // insert VariantValues
    await queryInterface.bulkInsert("VariantValues", variantValues);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("VariantValues", {
      id: [34, 35, 36, 37, 45, 38, 39, 40, 41, 42, 43, 44],
    });
    await queryInterface.bulkDelete("VariantTypes", {
      id: [16, 17, 18],
    });
  },
};
