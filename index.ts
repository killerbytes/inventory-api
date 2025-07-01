import express from "express";

import usersRouter from "./routes/users.router";
import authRouter from "./routes/auth.router";
import categoriesRouter from "./routes/categories.router";
import productsRouter from "./routes/products.router";
import suppliersRouter from "./routes/supplier.router";
import inventoryRouter from "./routes/inventory.router";
import purchaseRouter from "./routes/purchaseOrder.router";
import salesRouter from "./routes/salesOrder.router";

import bodyParser from "body-parser";
import cors from "cors";
import { verifyToken } from "./middlewares/verifyToken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import db from "./models";
import ApiError from "./services/ApiError";
import dotenv from "dotenv";
import { ValidationError } from "sequelize";
dotenv.config();

const { User } = db;

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username: string, password: string, done: any) => {
      try {
        const user = await User.scope("withPassword").findOne({
          where: { username, isActive: true },
        });

        if (!user || !User.validatePassword(password, user.password)) {
          // return done(null, false, { message: "Invalid username or password" });
          throw ApiError.badRequest("Invalid username or password");
        }
        console.log("from index", user);

        return done(null, user); // If the user is found, return the user object
      } catch (error) {
        return done(error);
      }
    }
  )
);

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/users", verifyToken, usersRouter);
app.use("/api/categories", verifyToken, categoriesRouter);
app.use("/api/products", verifyToken, productsRouter);
app.use("/api/suppliers", verifyToken, suppliersRouter);
app.use("/api/inventory", verifyToken, inventoryRouter);
app.use("/api/purchase", verifyToken, purchaseRouter);
app.use("/api/sales", verifyToken, salesRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((err, req, res, next) => {
  // If this isn't our custom error, convert it
  let errors = err.errors;
  if (err instanceof ValidationError) {
    errors = err.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }
  console.log("ENV", process.env.NODE_ENV);

  if (!(err instanceof ApiError)) {
    err = ApiError.internal(err.message, {
      originalError: err,
      // originalError: process.env.NODE_ENV === "development" ? err : undefined,
    });
  }

  // Log the error (in production you might want to use a proper logger)
  console.error(err);

  // Send the error response
  res.status(err.statusCode).json({
    code: err.code,
    details: err.details,
    statusCode: err.statusCode,
    message: err.message,
    errors,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    stack: err.stack,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
