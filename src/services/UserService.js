const db = require("../models");
const { User } = db;
const { Op } = require("sequelize");

class UserService {
  async getAll() {
    return await User.findAll({
      attributes: ["id", "email", "name"],
      raw: true,
      nest: true,
    });
  }
}

module.exports = new UserService();
