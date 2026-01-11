const express = require("express");
// const bodyParser = require("body-parser");
const pinoHttp = require("pino-http");
const cors = require("cors");
const dotenv = require("dotenv");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/users.router");
const authRouter = require("./routes/auth.router");
const categoriesRouter = require("./routes/categories.router");
const productsRouter = require("./routes/products.router");
const suppliersRouter = require("./routes/supplier.router");
const customersRouter = require("./routes/customer.router");
const inventoryRouter = require("./routes/inventory.router");
const invoiceRouter = require("./routes/invoice.router");
const paymentRouter = require("./routes/payment.router");
const goodReceiptRouter = require("./routes/goodReceipt.router");
const salesRouter = require("./routes/salesOrder.router");
const variantTypesRouter = require("./routes/variantTypes.router");
const productCombinationRouter = require("./routes/productCombination.router");
const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
// const zlib = require("zlib");
const verifyToken = require("./middlewares/verifyToken");
const passport = require("./middlewares/passport");
const logger = require("./middlewares/logger");

dotenv.config({ path: envPath });

const app = express();
// app.use(bodyParser.json()); // Middleware to parse JSON bodies
// app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
); // Enable CORS for all routes

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser());

app.use(passport.initialize());
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      return req.headers["x-request-id"] || randomUUID();
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", verifyToken(), usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", verifyToken(), productsRouter);
app.use("/api/customers", verifyToken(), customersRouter);
app.use("/api/suppliers", verifyToken(), suppliersRouter);
app.use("/api/inventory", verifyToken(), inventoryRouter);
app.use("/api/good-receipt", verifyToken(), goodReceiptRouter);
app.use("/api/sales", verifyToken(), salesRouter);
app.use("/api/variant-types", verifyToken(), variantTypesRouter);
app.use("/api/product-combinations", productCombinationRouter);
app.use("/api/invoices", verifyToken(), invoiceRouter);
app.use("/api/payments", verifyToken(), paymentRouter);
app.post("/api/backup", (req, res) => {
  const backup = spawn("node", ["backup.js", "backup"], {
    stdio: "inherit", // pipes logs to server logs
  });

  backup.on("close", (code) => {
    if (code === 0) {
      res.send("✅ Backup finished successfully!");
    } else {
      res.status(500).send(`❌ Backup failed with exit code ${code}`);
    }
  });

  backup.on("error", (err) => {
    res.status(500).send("❌ Failed to start backup: " + err.message);
  });
});

app.get("/api", (req, res) => {
  const { BUILD_TIME } = require("../dist/build-info");
  res.json({
    env: env,
    buildTime: BUILD_TIME,
  });
});

module.exports = app;
