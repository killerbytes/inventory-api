"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("Products", ["name"], {
      name: "unique_active_name",
      unique: true,
      where: {
        deletedAt: {
          [Sequelize.Op.is]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Products", "unique_active_name");
  },
};
