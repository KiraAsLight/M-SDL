// backend/routes/hardwareRoutes.js
const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');

// Arduino endpoints
router.post('/rfid-scan', hardwareController.handleRFIDScan);
router.post('/vibration-alert', hardwareController.handleVibrationAlert);
router.post('/heartbeat', hardwareController.handleHeartbeat);
router.get('/door-command/:deviceId', hardwareController.getDoorCommand);

module.exports = router;