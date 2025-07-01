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
        {
          name: "Cesare Alkin",
          username: "calkin2",
          email: "calkin2@timesonline.co.uk",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Gisella Skilling",
          username: "gskilling3",
          email: "gskilling3@wordpress.org",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Farand Vigrass",
          username: "fvigrass4",
          email: "fvigrass4@hao123.com",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Danica Gosselin",
          username: "dgosselin5",
          email: "dgosselin5@nasa.gov",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sutherland Angrove",
          username: "sangrove6",
          email: "sangrove6@independent.co.uk",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Diane Redgewell",
          username: "dredgewell7",
          email: "dredgewell7@lycos.com",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kevon Antognoni",
          username: "kantognoni8",
          email: "kantognoni8@ucoz.com",
          password: User.generateHash("1234"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Helen Paynter",
          username: "hpaynter9",
          email: "hpaynter9@altervista.org",
          password: User.generateHash("1234"),
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
