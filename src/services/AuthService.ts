const jwt = require("jsonwebtoken");
const db = require("../models");
const { User } = db;

class AuthService {
  async getCurrentUser(req: any) {
    const token = req.headers["x-access-token"];

    if (!token) throw new Error("No token provided");
    const { id } = jwt.decode(token);
    const user = await User.findByPk(id, { raw: true });
    return user;
  }
}

module.exports = new AuthService();
