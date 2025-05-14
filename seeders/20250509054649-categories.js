"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    queryInterface.bulkInsert(
      "Categories",
      [
        {
          name: "Electronics",
          description: "Devices and gadgets",
        },
        {
          name: "Clothing",
          description: "Apparel and accessories",
        },
        {
          name: "Books",
          description: "Literature and educational materials",
        },
        {
          name: "Home & Kitchen",
          description: "Household items and kitchenware",
        },
        {
          name: "Sports & Outdoors",
          description: "Sporting goods and outdoor equipment",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
