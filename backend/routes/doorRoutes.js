const express = require("express");
const router = express.Router();
const doorController = require("../controllers/doorController");

// Route Log Aktivitas
router.get("/log-aktivitas", doorController.getLogActivity);

// Route History (pakai rentang waktu)
router.get("/history", doorController.getHistory);

// Route Status Pintu
router.get("/status", doorController.getDoorStatus);

module.exports = router;
