const formatErrors = require("../utils/formatErrors");
const passport = require("passport");
const { generateToken, verifyToken, decodeToken } = require("../utils/jwt");
const { loginSchema } = require("../utils/validations");
const db = require("../models");
const { User } = db;

const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json(formatErrors(error));
  }

  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);
    return res.status(200).json({ token });
  })(req, res, next);
};

const me = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    const { id } = decodeToken(token);
    const user = await User.findByPk(id, { raw: true });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(formatErrors(error));
  }
};

module.exports = { login, me, generateToken };
