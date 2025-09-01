const express = require("express");
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/me", verifyToken, authController.me);
router.post("/login", authController.login);

module.exports = router;
