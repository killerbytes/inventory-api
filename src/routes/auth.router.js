const express = require("express");
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");
const { auth } = require("googleapis/build/src/apis/abusiveexperiencereport");

const router = express.Router();

router.get("/me", verifyToken(), authController.me);
router.post("/login", authController.login);
router.post("/changePassword", verifyToken(), authController.changePassword);

module.exports = router;
