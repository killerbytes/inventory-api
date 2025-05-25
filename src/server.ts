const express = require("express");
import { Request, Response, NextFunction } from "express";
import ApiError from "./services/ApiError";
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const suppliersRouter = require("./routes/suppliers");
const customersRouter = require("./routes/customers");
const productsRouter = require("./routes/products");
const inventoryRouter = require("./routes/inventory");
const salesRouter = require("./routes/salesOrders");
const categoriesRouter = require("./routes/categories");
const purchaseOrdersRouter = require("./routes/purchaseOrders");
const purchaseOrderItemsRouter = require("./routes/purchaseOrderItems");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
const { User } = require("./models"); // Adjust the path to your models
const purchaseOrder = require("./models/purchaseOrder");
const { verifyToken, errHandler } = require("./utils/jwt");
dotenv.config();

const app = express();
const port = 3000;

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
app.use("/api/suppliers", verifyToken, suppliersRouter);
app.use("/api/customers", verifyToken, customersRouter);
app.use("/api/products", verifyToken, productsRouter);
app.use("/api/categories", verifyToken, categoriesRouter);
// app.use("/api/purchase/items", verifyToken, purchaseOrderItemsRouter); // Add this line to include the purchase order item routes
app.use("/api/purchase", verifyToken, purchaseOrdersRouter); // Add this line to include the purchase order routes
app.use("/api/inventory", verifyToken, inventoryRouter);
app.use("/api/sales", verifyToken, salesRouter);

app.use("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// app.use((err: any, req: Request, res: Response) => {
//   console.log(7777, err);

//   if (err instanceof ApiError) {
//     return res.status(err.statusCode).json(err.toJSON());
//   }

//   // Handle non-ApiError errors
//   const apiError = new ApiError(
//     "INTERNAL_SERVER_ERROR",
//     "An unexpected error occurred",
//     process.env.NODE_ENV === "development" ? err.message : undefined
//   );

//   res.status(500).json(apiError.toJSON());
// });

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
