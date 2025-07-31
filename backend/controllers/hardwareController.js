// backend/controllers/hardwareController.js
const db = require('../config/db');
const socketManager = require('../websocket/socketHandler');

// Handle RFID card scan
exports.handleRFIDScan = async (req, res) => {
  const { cardId, deviceId, timestamp } = req.body;
  
  console.log(`RFID Scan: Card ${cardId} on device ${deviceId}`);
  
  try {
    // Check if card is authorized
    const [cardData] = await db.execute(
      "SELECT * FROM authorized_cards WHERE card_id = ? AND is_active = 1",
      [cardId]
    );
    
    let response = {
      success: false,
      action: 'DENY',
      message: 'Kartu tidak terdaftar',
      buzzer: 'ERROR', // ERROR, SUCCESS, DENIED
      duration: 1000
    };
    
    if (cardData.length > 0) {
      response = {
        success: true,
        action: 'UNLOCK',
        message: 'Akses berhasil',
        buzzer: 'SUCCESS',
        duration: 3000, // Auto lock after 3 seconds
        autoLock: true
      };
      
      // Log successful access
      await db.execute(
        `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
         VALUES (?, ?, 'berhasil', 'Akses RFID berhasil', ?)`,
        [cardId, cardData[0].user_name, deviceId]
      );
      
      // Real-time update to web
      socketManager.broadcastToWebClients({
        type: 'RFID_ACCESS',
        cardId: cardId,
        userName: cardData[0].user_name,
        status: 'berhasil',
        timestamp: new Date(),
        deviceId: deviceId
      });
      
    } else {
      // Log failed access
      await db.execute(
        `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
         VALUES (?, 'Unknown', 'gagal', 'Kartu tidak terdaftar', ?)`,
        [cardId, deviceId]
      );
      
      // Real-time update to web
      socketManager.broadcastToWebClients({
        type: 'RFID_ACCESS',
        cardId: cardId,
        userName: 'Unknown',
        status: 'gagal',
        timestamp: new Date(),
        deviceId: deviceId
      });
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('RFID scan error:', error);
    res.status(500).json({
      success: false,
      action: 'DENY',
      message: 'System error',
      buzzer: 'ERROR',
      duration: 2000
    });
  }
};

// Handle vibration sensor alert
exports.handleVibrationAlert = async (req, res) => {
  const { deviceId, intensity, timestamp, duration } = req.body;
  
  console.log(`Vibration Alert: Device ${deviceId}, Intensity: ${intensity}`);
  
  try {
    // Determine alert level
    let alertLevel = 'LOW';
    let message = 'Getaran terdeteksi';
    
    if (intensity > 800) {
      alertLevel = 'HIGH';
      message = 'Getaran kuat - Kemungkinan percobaan pembongkaran!';
    } else if (intensity > 500) {
      alertLevel = 'MEDIUM';
      message = 'Getaran sedang terdeteksi';
    }
    
    // Log vibration event
    await db.execute(
      `INSERT INTO log_aktivitas (kartu_id, pengguna, status, keterangan, device_id) 
       VALUES ('VIBRATION', 'System', 'warning', ?, ?)`,
      [message, deviceId]
    );
    
    // Send real-time alert to web
    socketManager.broadcastToWebClients({
      type: 'VIBRATION_ALERT',
      deviceId: deviceId,
      intensity: intensity,
      alertLevel: alertLevel,
      message: message,
      timestamp: new Date(),
      duration: duration
    });
    
    // Response to Arduino
    const response = {
      success: true,
      action: alertLevel === 'HIGH' ? 'ALARM' : 'LOG',
      buzzer: alertLevel === 'HIGH' ? 'ALARM' : 'WARNING',
      duration: alertLevel === 'HIGH' ? 5000 : 1000
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Vibration alert error:', error);
    res.status(500).json({ success: false });
  }
};

// Handle Arduino heartbeat (device status)
exports.handleHeartbeat = async (req, res) => {
  const { deviceId, status, sensors } = req.body;
  
  try {
    // Update device status
    await db.execute(
      `INSERT INTO device_status (device_id, status, sensors_data, last_heartbeat) 
       VALUES (?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
       status = VALUES(status), 
       sensors_data = VALUES(sensors_data), 
       last_heartbeat = NOW()`,
      [deviceId, status, JSON.stringify(sensors)]
    );
    
    // Check if device was offline and now online
    socketManager.broadcastToWebClients({
      type: 'DEVICE_STATUS',
      deviceId: deviceId,
      status: status,
      sensors: sensors,
      timestamp: new Date()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ success: false });
  }
};

// Get pending commands for Arduino
exports.getDoorCommand = async (req, res) => {
  const { deviceId } = req.params;
  
  try {
    const [commands] = await db.execute(
      `SELECT * FROM door_commands 
       WHERE device_id = ? AND status = 'PENDING' 
       ORDER BY created_at ASC LIMIT 1`,
      [deviceId]
    );
    
    if (commands.length > 0) {
      const command = commands[0];
      
      // Mark as sent
      await db.execute(
        "UPDATE door_commands SET status = 'SENT' WHERE id = ?",
        [command.id]
      );
      
      res.json({
        hasCommand: true,
        command: command.command,
        parameters: JSON.parse(command.parameters || '{}'),
        commandId: command.id
      });
    } else {
      res.json({ hasCommand: false });
    }
    
  } catch (error) {
    console.error('Get command error:', error);
    res.status(500).json({ hasCommand: false });
  }
};