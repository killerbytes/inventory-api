// strategies/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import db from "../models";

const { User } = db;

// Define the LocalStrategy once
passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username: string, password: string, done: any) => {
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
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
