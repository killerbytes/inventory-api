const jwt = require("jsonwebtoken");
const { authStorage } = require("../services/auth.service");

const verifyToken = (options = {}) => {
  return (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      options.maxAge ? { maxAge: options.maxAge } : {},
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (options.scope && decoded.scope !== options.scope) {
          return res.status(403).json({ message: "Invalid token scope" });
        }

        req.userId = decoded.id;

        authStorage.run({ userId: decoded.id }, () => {
          next();
        });
      }
    );
  };
};

module.exports = verifyToken;
