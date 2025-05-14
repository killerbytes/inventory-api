const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Correct import path
const authController = require("../controllers/auth"); // Correct import path
const { body, validationResult } = require("express-validator");

// router.post(
//   "/login",
//   [
//     body("username").notEmpty().withMessage("Username is required"),
//     body("password").isLength({ min: 6 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//       const result = await authController.login(req.body);
//       console.log("result", result);

//       if (!result) {
//         return res.status(401).json({ error: "Invalid username or password" });
//       }

//       res.json(req.body);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

router.post("/login", authController.login);
router.get("/me", authController.me);

module.exports = router;
