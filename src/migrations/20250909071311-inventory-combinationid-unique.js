"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("Inventories", ["combinationId"], {
      name: "unique_combination_id",
      unique: true,
      where: {
        deletedAt: {
          [Sequelize.Op.is]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Inventories", "unique_combination_id");
  },
};
