"use strict";
const { sequelize } = require("../models/index.js");
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Categories",
      [
        {
          id: 1,
          name: "Building Materials",
          description: "",
          order: 0,
          parentId: null,
        },
        {
          id: 2,
          name: "Paints and Accessories",
          description: "",
          order: 1,
          parentId: null,
        },
        {
          id: 3,
          name: "Hardware",
          description: "",
          order: 2,
          parentId: null,
        },
        {
          id: 4,
          name: "Plumbing",
          description: "",
          order: 3,
          parentId: null,
        },
        {
          id: 5,
          name: "Tools",
          description: "",
          order: 4,
          parentId: null,
        },
        {
          id: 6,
          name: "Electrical",
          description: "",
          order: 5,
          parentId: null,
        },
        {
          id: 7,
          name: "Adhesives and Sealants",
          description: "",
          order: 6,
          parentId: null,
        },
        {
          id: 8,
          name: "Grease and Lubricants",
          description: "",
          order: 7,
          parentId: null,
        },
      ],
      {}
    );

    await sequelize.query(
      `SELECT setval('\"Categories_id_seq\"', (SELECT COALESCE(MAX(id), 1) FROM "Categories"));`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
