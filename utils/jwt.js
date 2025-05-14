const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decoded.id;

    next();
  });
};

module.exports = { generateToken, decodeToken, verifyToken };
