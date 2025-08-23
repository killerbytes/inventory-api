const express = require("express");
const usersRouter = require("./routes/users.router");
const authRouter = require("./routes/auth.router");
const categoriesRouter = require("./routes/categories.router");
const productsRouter = require("./routes/products.router");
const suppliersRouter = require("./routes/supplier.router");
const customersRouter = require("./routes/customer.router");
const inventoryRouter = require("./routes/inventory.router");
const purchaseRouter = require("./routes/purchaseOrder.router");
const salesRouter = require("./routes/salesOrder.router");
const variantTypesRouter = require("./routes/variantTypes.router");
const productCombinationRouter = require("./routes/productCombination.router");
const bodyParser = require("body-parser");
const cors = require("cors");
const verifyToken = require("./middlewares/verifyToken");
const dotenv = require("dotenv");
const errorHandler = require("./middlewares/errorHandler");
const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
const passport = require("./middlewares/passport");
dotenv.config({ path: envPath });

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

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

module.exports = app;
