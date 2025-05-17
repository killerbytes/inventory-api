const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth"); // Correct import path
const { verifyToken } = require("../utils/jwt");

router.post("/login", authController.login);
router.get("/me", verifyToken, authController.me);

module.exports = router;
