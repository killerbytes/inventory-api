"use strict";

const { getBarcode, getSKU } = require("../utils/string");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductCombinations", "barcode", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    const {
      ProductCombination,
      VariantValue,
      Product,
      Category,
    } = require("../models");

    const combinations = await ProductCombination.findAll({
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: Category, as: "category" }],
        },
        { model: VariantValue, as: "values" },
      ],
    });

    for (const combo of combinations) {
      const generatedBarcode = getBarcode(combo.id);

      const generatedSKU = getSKU(
        combo.product.name,
        combo.product.categoryId,
        combo.unit,
        combo.values
      );

      await queryInterface.bulkUpdate(
        "ProductCombinations",
        { sku: generatedSKU, barcode: generatedBarcode },
        { id: combo.id }
      );
    }

    await queryInterface.addIndex("ProductCombinations", ["barcode"], {
      name: "unique_active_barcode",
      unique: true,
      where: { deletedAt: null },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "ProductCombinations",
      "unique_active_barcode"
    );
    await queryInterface.removeColumn("ProductCombinations", "barcode");
  },
};
