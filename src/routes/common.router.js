const express = require("express");
const productsController = require("../controllers/products.controller");
const verifyToken = require("../middlewares/verifyToken");
const { ROLES } = require("../definitions");
const router = express.Router();
const { spawn } = require("child_process");

router.post(
  "/update-sheet",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  productsController.updateSheet,
);

router.post("/backup", verifyToken({ adminOnly: true }), (req, res) => {
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

module.exports = router;
