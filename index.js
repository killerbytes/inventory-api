"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_router_1 = __importDefault(require("./routes/users.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const categories_router_1 = __importDefault(require("./routes/categories.router"));
const products_router_1 = __importDefault(require("./routes/products.router"));
const supplier_router_1 = __importDefault(require("./routes/supplier.router"));
const inventory_router_1 = __importDefault(require("./routes/inventory.router"));
const purchaseOrder_router_1 = __importDefault(require("./routes/purchaseOrder.router"));
const salesOrder_router_1 = __importDefault(require("./routes/salesOrder.router"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const verifyToken_1 = require("./middlewares/verifyToken");
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const models_1 = __importDefault(require("./models"));
const ApiError_1 = __importDefault(require("./services/ApiError"));
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
const { User } = models_1.default;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json()); // Middleware to parse JSON bodies
app.use(body_parser_1.default.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use(express_1.default.json()); // Middleware to parse JSON bodies
passport_1.default.use(new passport_local_1.Strategy({ usernameField: "username", passwordField: "password" }, async (username, password, done) => {
    try {
        const user = await User.scope("withPassword").findOne({
            where: { username, isActive: true },
        });
        if (!user || !User.validatePassword(password, user.password)) {
            // return done(null, false, { message: "Invalid username or password" });
            throw ApiError_1.default.badRequest("Invalid username or password");
        }
        console.log("from index", user);
        return done(null, user); // If the user is found, return the user object
    }
    catch (error) {
        return done(error);
    }
}));
app.use(passport_1.default.initialize());
app.use("/api/auth", auth_router_1.default);
app.use("/api/users", verifyToken_1.verifyToken, users_router_1.default);
app.use("/api/categories", verifyToken_1.verifyToken, categories_router_1.default);
app.use("/api/products", verifyToken_1.verifyToken, products_router_1.default);
app.use("/api/suppliers", verifyToken_1.verifyToken, supplier_router_1.default);
app.use("/api/inventory", verifyToken_1.verifyToken, inventory_router_1.default);
app.use("/api/purchase", verifyToken_1.verifyToken, purchaseOrder_router_1.default);
app.use("/api/sales", verifyToken_1.verifyToken, salesOrder_router_1.default);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use((err, req, res, next) => {
    // If this isn't our custom error, convert it
    let errors = err.errors;
    if (err instanceof sequelize_1.ValidationError) {
        errors = err.errors.map((err) => ({
            field: err.path,
            message: err.message,
        }));
    }
    console.log("ENV", process.env.NODE_ENV);
    if (!(err instanceof ApiError_1.default)) {
        err = ApiError_1.default.internal(err.message, {
            originalError: process.env.NODE_ENV === "development" ? err : undefined,
        });
    }
    // Log the error (in production you might want to use a proper logger)
    console.error(err);
    // Send the error response
    res.status(err.statusCode).json(Object.assign({ code: err.code, details: err.details, statusCode: err.statusCode, message: err.message, errors }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
