const express = require("express");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const suppliersRouter = require("./routes/suppliers");
const customersRouter = require("./routes/customers");
const productsRouter = require("./routes/products");
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
    async (username, password, done) => {
      try {
        const user = await User.scope("withPassword").findOne({
          where: { username },
        });

        if (!user || !User.validatePassword(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
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
app.use("/api/users", usersRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/purchase/items", purchaseOrderItemsRouter); // Add this line to include the purchase order item routes
app.use("/api/purchase", purchaseOrdersRouter); // Add this line to include the purchase order routes

app.use("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
