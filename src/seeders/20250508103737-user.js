"use strict";

const db = require("../models");
const { User } = db;

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
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Joel Carlos",
          username: "killerbytes",
          email: "azid@azid.com",
          password: User.generateHash("1234"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test User 1",
          username: "user1",
          email: "pcordes0@hud.gov",
          password: User.generateHash("1234"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test User 2",
          username: "user2",
          email: "kerley1@sfgate.com",
          password: User.generateHash("1234"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
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
