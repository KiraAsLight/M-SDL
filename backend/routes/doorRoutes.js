const express = require("express");
const router = express.Router();
const doorController = require("../controllers/doorController");

// Route Log Aktivitas
router.get("/log-aktivitas", doorController.getLogActivity);

// Route History (pakai rentang waktu)
router.get("/history", doorController.getHistory);

// Route Status Pintu
<<<<<<< HEAD
router.get("/status", doorController.getDoorStatus);
=======
// router.get("/status", doorController.getDoorStatus);
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda

module.exports = router;
