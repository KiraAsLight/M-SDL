const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/request-reset", authController.requestReset);
router.get("/reset-password/:token", authController.validateToken);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;