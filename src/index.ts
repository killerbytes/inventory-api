import express from "express";
import usersRouter from "./routes/users.router";
import authRouter from "./routes/auth.router";
import categoriesRouter from "./routes/categories.router";
import productsRouter from "./routes/products.router";
import suppliersRouter from "./routes/supplier.router";
import customersRouter from "./routes/customer.router";
import inventoryRouter from "./routes/inventory.router";
import purchaseRouter from "./routes/purchaseOrder.router";
import salesRouter from "./routes/salesOrder.router";
import variantTypesRouter from "./routes/variantTypes.router";
import productCombinationRouter from "./routes/productCombination.router";
import bodyParser from "body-parser";
import cors from "cors";
import { verifyToken } from "./middlewares/verifyToken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import db from "./models";
import ApiError from "./services/ApiError";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
dotenv.config({ path: envPath });

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
          console.log(
            9876434,
            user,
            User.validatePassword(password, user.password)
          );

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
app.use("/api/categories", categoriesRouter);
app.use("/api/products", verifyToken, productsRouter);
app.use("/api/customers", verifyToken, customersRouter);
app.use("/api/suppliers", verifyToken, suppliersRouter);
app.use("/api/inventory", verifyToken, inventoryRouter);
app.use("/api/purchase", verifyToken, purchaseRouter);
app.use("/api/sales", verifyToken, salesRouter);
app.use("/api/variantTypes", verifyToken, variantTypesRouter);
app.use("/api/productCombinations", verifyToken, productCombinationRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
