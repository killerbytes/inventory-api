// strategies/passport.ts
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../models");

const { User } = db;

// Define the LocalStrategy once
passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const user = await User.scope("withPassword").findOne({
          where: { username, isActive: true },
        });
        const x = await User.findAll();

        if (!user || !User.validatePassword(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize/deserialize if needed (for sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
