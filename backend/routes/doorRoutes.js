const express = require("express");
const router = express.Router();
const doorController = require("../controllers/doorController");

// Route Log Aktivitas (existing)
router.get("/log-aktivitas", doorController.getLogActivity);

// Route History (existing)
router.get("/history", doorController.getHistory);

// Route Status Pintu (enhanced)
router.get("/status", doorController.getDoorStatus);

// Route Statistics (enhanced)
router.get("/statistics", doorController.getActivityStats);

// Route untuk Dashboard Summary (lebih ringkas dan cepat)
router.get("/dashboard-summary", doorController.getDashboardSummary);

// Route untuk menghapus log aktivitas
router.delete("/history/:id_log", doorController.deleteLog);

module.exports = router;