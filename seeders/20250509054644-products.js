"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Products",
      [
        {
          name: "Pressure-Treated Lumber",
          categoryId: 1,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Plywood Sheets",
          categoryId: 1,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Roofing Shingles",
          categoryId: 1,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Assorted Nails",
          categoryId: 2,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wood Screws",
          categoryId: 2,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Door Hinges",
          categoryId: 2,
          unit: "PACK",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Interior Wall Paint",
          categoryId: 3,
          unit: "GAL",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Exterior Primer",
          categoryId: 3,
          unit: "GAL",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wood Stain",
          categoryId: 3,
          unit: "GAL",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Cordless Drill",
          categoryId: 4,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Circular Saw",
          categoryId: 4,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tool Set",
          categoryId: 4,
          unit: "SET",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "PVC Pipes",
          categoryId: 5,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pipe Fittings",
          categoryId: 5,
          unit: "PACK",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Water Heater",
          categoryId: 5,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "LED Light Bulbs",
          categoryId: 6,
          unit: "PACK",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Electrical Wire",
          categoryId: 6,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Circuit Breaker",
          categoryId: 6,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Hardwood Flooring",
          categoryId: 7,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laminate Planks",
          categoryId: 7,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Vinyl Tile",
          categoryId: 7,
          unit: "BOX",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Base Cabinet",
          categoryId: 8,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bathroom Vanity",
          categoryId: 8,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Granite Countertop",
          categoryId: 8,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Interior Door",
          categoryId: 9,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Storm Door",
          categoryId: 9,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Double-Hung Window",
          categoryId: 9,
          unit: "PCS",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Potting Soil",
          categoryId: 10,
          unit: "BAG",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mulch",
          categoryId: 10,
          unit: "BAG",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Fertilizer",
          categoryId: 10,
          unit: "BAG",
          reorderLevel: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
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
