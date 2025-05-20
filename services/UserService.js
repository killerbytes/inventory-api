const { User } = require("../models");
const { decodeToken } = require("../utils/jwt");

class UserService {
  async create(data) {
    return data;
  }
  async getCurrent(req) {
    const token = req.headers["x-access-token"];

    const { id } = decodeToken(token);
    const user = await User.findByPk(id, { raw: true });
    return user;
  }
}

module.exports = new UserService();
