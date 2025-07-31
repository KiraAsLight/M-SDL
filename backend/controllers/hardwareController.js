// backend/controllers/hardwareController.js
const db = require("../config/db");
const socketManager = require("../websocket/socketHandler");

// Handle RFID card scan
exports.handleRFIDScan = async (req, res) => {
  const { cardId, deviceId, timestamp } = req.body;

  console.log(`RFID Scan: Card ${cardId} on device ${deviceId || "MAIN_DOOR"}`);

  try {
    // Check if card is authorized
    const [cardData] = await db.execute(
      "SELECT * FROM authorized_cards WHERE card_id = ? AND is_active = 1",
      [cardId]
    );

    let response = {
      success: false,
      action: "DENY",
      message: "Kartu tidak terdaftar atau tidak aktif",
      buzzer: "ERROR", // ERROR, SUCCESS, DENIED
      duration: 1000,
    };

    let logStatus = "gagal";
    let logKeterangan = "Kartu tidak terdaftar";
    let userName = "Unknown";

    if (cardData.length > 0) {
      response = {
        success: true,
        action: "UNLOCK",
        message: "Akses berhasil",
        buzzer: "SUCCESS",
        duration: 3000, // Auto lock after 3 seconds
        autoLock: true,
      };

      logStatus = "berhasil";
      logKeterangan = "Akses RFID berhasil";
      userName = cardData[0].user_name;
    }

    // Log access attempt (berhasil atau gagal)
    await db.execute(
      `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [cardId, userName, logStatus, logKeterangan, deviceId || "MAIN_DOOR"]
    );

    // Real-time update to web clients
    socketManager.broadcastToWebClients({
      type: "RFID_ACCESS",
      cardId: cardId,
      userName: userName,
      status: logStatus,
      message: logKeterangan,
      timestamp: new Date(),
      deviceId: deviceId || "MAIN_DOOR",
    });

    res.json(response);
  } catch (error) {
    console.error("RFID scan error:", error);

    // Log system error
    try {
      await db.execute(
        `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
         VALUES (?, 'System', 'gagal', 'System error during RFID scan', ?)`,
        [cardId, deviceId || "MAIN_DOOR"]
      );
    } catch (logError) {
      console.error("Failed to log system error:", logError);
    }

    res.status(500).json({
      success: false,
      action: "DENY",
      message: "System error",
      buzzer: "ERROR",
      duration: 2000,
    });
  }
};

// Handle vibration sensor alert
exports.handleVibrationAlert = async (req, res) => {
  const { deviceId, intensity, timestamp, duration } = req.body;

  console.log(
    `Vibration Alert: Device ${
      deviceId || "MAIN_DOOR"
    }, Intensity: ${intensity}`
  );

  try {
    // Determine alert level
    let alertLevel = "LOW";
    let message = "Getaran ringan terdeteksi";
    let logStatus = "pending";

    if (intensity > 800) {
      alertLevel = "HIGH";
      message =
        "PERINGATAN: Getaran kuat - Kemungkinan percobaan pembongkaran!";
      logStatus = "gagal";
    } else if (intensity > 500) {
      alertLevel = "MEDIUM";
      message = "Getaran sedang terdeteksi pada pintu";
      logStatus = "pending";
    }

    // Log vibration event
    await db.execute(
      `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
       VALUES ('SENSOR_VIBRATION', 'System Sensor', ?, ?, ?)`,
      [logStatus, message, deviceId || "MAIN_DOOR"]
    );

    // Send real-time alert to web clients
    socketManager.broadcastToWebClients({
      type: "VIBRATION_ALERT",
      deviceId: deviceId || "MAIN_DOOR",
      intensity: intensity,
      alertLevel: alertLevel,
      message: message,
      timestamp: new Date(),
      duration: duration || 1000,
    });

    // Response to Arduino
    const response = {
      success: true,
      action: alertLevel === "HIGH" ? "ALARM" : "LOG",
      buzzer: alertLevel === "HIGH" ? "ALARM" : "WARNING",
      duration: alertLevel === "HIGH" ? 5000 : 1000,
      message: `Vibration alert logged - Level: ${alertLevel}`,
    };

    res.json(response);
  } catch (error) {
    console.error("Vibration alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process vibration alert",
      error: error.message,
    });
  }
};

// Handle Arduino heartbeat (device status)
exports.handleHeartbeat = async (req, res) => {
  const { deviceId, status, sensors } = req.body;
  const finalDeviceId = deviceId || "MAIN_DOOR";

  try {
    // Update or insert device status
    await db.execute(
      `INSERT INTO device_status (device_id, status, sensors_data, last_heartbeat) 
       VALUES (?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
       status = VALUES(status), 
       sensors_data = VALUES(sensors_data), 
       last_heartbeat = NOW()`,
      [finalDeviceId, status || "online", JSON.stringify(sensors || {})]
    );

    // Check if device was offline and now online (optional logging)
    const [previousStatus] = await db.execute(
      `SELECT status FROM device_status WHERE device_id = ?`,
      [finalDeviceId]
    );

    // Broadcast device status to web clients
    socketManager.broadcastToWebClients({
      type: "DEVICE_STATUS",
      deviceId: finalDeviceId,
      status: status || "online",
      sensors: sensors || {},
      timestamp: new Date(),
      wasOffline:
        previousStatus.length > 0 && previousStatus[0].status === "offline",
    });

    res.json({
      success: true,
      message: "Heartbeat received",
      deviceId: finalDeviceId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process heartbeat",
      error: error.message,
    });
  }
};

// Get pending commands for Arduino
exports.getDoorCommand = async (req, res) => {
  const { deviceId } = req.params;
  const finalDeviceId = deviceId || "MAIN_DOOR";

  try {
    const [commands] = await db.execute(
      `SELECT * FROM door_commands 
       WHERE device_id = ? AND status = 'PENDING' 
       ORDER BY created_at ASC LIMIT 1`,
      [finalDeviceId]
    );

    if (commands.length > 0) {
      const command = commands[0];

      // Mark as sent
      await db.execute(
        "UPDATE door_commands SET status = 'SENT', updated_at = NOW() WHERE id = ?",
        [command.id]
      );

      // Log command execution
      await db.execute(
        `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
         VALUES ('REMOTE_COMMAND', 'Remote Control', 'berhasil', ?, ?)`,
        [`Remote command executed: ${command.command}`, finalDeviceId]
      );

      res.json({
        hasCommand: true,
        command: command.command,
        parameters: JSON.parse(command.parameters || "{}"),
        commandId: command.id,
        timestamp: command.created_at,
      });
    } else {
      res.json({
        hasCommand: false,
        message: "No pending commands",
        deviceId: finalDeviceId,
      });
    }
  } catch (error) {
    console.error("Get command error:", error);
    res.status(500).json({
      hasCommand: false,
      error: error.message,
      message: "Failed to retrieve commands",
    });
  }
};

// Send command to device (for remote control)
exports.sendDoorCommand = async (req, res) => {
  const { command, deviceId, parameters } = req.body;
  const finalDeviceId = deviceId || "MAIN_DOOR";

  if (!command) {
    return res.status(400).json({
      success: false,
      message: "Command is required",
    });
  }

  try {
    // Insert command into database
    const [result] = await db.execute(
      "INSERT INTO door_commands (device_id, command, parameters, status) VALUES (?, ?, ?, 'PENDING')",
      [finalDeviceId, command, JSON.stringify(parameters || {})]
    );

    // Send command via WebSocket to device (if connected)
    socketManager.sendToDevice(finalDeviceId, {
      type: "DOOR_COMMAND",
      command: command,
      parameters: parameters || {},
      commandId: result.insertId,
      timestamp: new Date(),
    });

    // Log remote command
    await db.execute(
      `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
       VALUES ('REMOTE_CONTROL', 'Web Admin', 'pending', ?, ?)`,
      [`Remote command sent: ${command}`, finalDeviceId]
    );

    res.json({
      success: true,
      message: `Command ${command} sent to device ${finalDeviceId}`,
      command: command,
      deviceId: finalDeviceId,
      commandId: result.insertId,
    });
  } catch (error) {
    console.error("Send command error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send command",
      error: error.message,
    });
  }
};

// Get device status
exports.getDeviceStatus = async (req, res) => {
  const { deviceId } = req.params;
  const finalDeviceId = deviceId || "MAIN_DOOR";

  try {
    const [deviceStatus] = await db.execute(
      "SELECT * FROM device_status WHERE device_id = ? ORDER BY last_heartbeat DESC LIMIT 1",
      [finalDeviceId]
    );

    if (deviceStatus.length === 0) {
      return res.json({
        deviceId: finalDeviceId,
        status: "offline",
        lastHeartbeat: null,
        sensors: null,
        message: "Device not found or never connected",
      });
    }

    const device = deviceStatus[0];
    const lastHeartbeat = new Date(device.last_heartbeat);
    const now = new Date();
    const timeDiff = now - lastHeartbeat;

    // Consider device offline if no heartbeat for more than 2 minutes
    const isOnline = timeDiff < 120000; // 2 minutes in milliseconds

    res.json({
      deviceId: device.device_id,
      status: isOnline ? device.status : "offline",
      lastHeartbeat: device.last_heartbeat,
      sensors: device.sensors_data ? JSON.parse(device.sensors_data) : null,
      timeSinceLastHeartbeat: Math.floor(timeDiff / 1000), // in seconds
      isOnline: isOnline,
    });
  } catch (error) {
    console.error("Device status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get device status",
      error: error.message,
    });
  }
};
