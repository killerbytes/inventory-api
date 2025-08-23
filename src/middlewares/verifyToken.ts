// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const { authStorage } = require("../services/auth.service");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = decoded.id;

    authStorage.run({ userId: decoded.id }, () => {
      next();
    });
  });
};

module.exports = verifyToken;
