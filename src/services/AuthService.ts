import { where } from "sequelize";
const jwt = require("jsonwebtoken");
const db = require("../models");
const { User } = db;

class AuthService {
  async getCurrentUser(req: any) {
    const token = req.headers["x-access-token"];

    if (!token) throw new Error("No token provided");
    const { id } = jwt.decode(token);
    try {
      const user = await User.findByPk(id, {
        raw: true,
        where: { isActive: true },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
