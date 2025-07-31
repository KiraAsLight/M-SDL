require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");

// Import routes
const authRoutes = require("./routes/authRoutes");
const doorRoutes = require("./routes/doorRoutes");
const hardwareRoutes = require("./routes/hardwareRoutes");
const cardRoutes = require("./routes/cardRoutes"); // NEW

// Import WebSocket handler
const socketManager = require("./websocket/socketHandler");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
socketManager.init(server);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:80",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "null", // for file:// protocol
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Static files
app.use("/static", express.static(path.join(__dirname, "../frontend/public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/door", doorRoutes);
app.use("/api/hardware", hardwareRoutes);
app.use("/api/cards", cardRoutes); // NEW: Card management routes

// Remote control endpoints
app.post("/api/remote/door-command", async (req, res) => {
  const { command, deviceId = "MAIN_DOOR" } = req.body;

  try {
    const db = require("./config/db");

    // Insert command into database
    await db.execute(
      "INSERT INTO door_commands (device_id, command, status) VALUES (?, ?, 'PENDING')",
      [deviceId, command]
    );

    // Send command via WebSocket to Arduino
    socketManager.sendToDevice(deviceId, {
      type: "DOOR_COMMAND",
      command: command,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: `Command ${command} sent to device ${deviceId}`,
      command,
      deviceId,
    });
  } catch (error) {
    console.error("Remote command error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send command",
      error: error.message,
    });
  }
});

// Get device status endpoint
app.get("/api/remote/device-status/:deviceId?", async (req, res) => {
  const { deviceId = "MAIN_DOOR" } = req.params;

  try {
    const db = require("./config/db");

    const [deviceStatus] = await db.execute(
      "SELECT * FROM device_status WHERE device_id = ? ORDER BY last_heartbeat DESC LIMIT 1",
      [deviceId]
    );

    if (deviceStatus.length === 0) {
      return res.json({
        deviceId,
        status: "offline",
        lastHeartbeat: null,
        sensors: null,
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
    });
  } catch (error) {
    console.error("Device status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get device status",
      error: error.message,
    });
  }
});

// WebSocket stats endpoint
app.get("/api/websocket/stats", (req, res) => {
  res.json(socketManager.getStats());
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Door Lock API Active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    websocket: socketManager.getStats(),
    cors: "enabled",
  });
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Smart Door Lock API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/login": "User login",
        "POST /api/auth/request-reset": "Request password reset",
        "GET /api/auth/reset-password/:token": "Validate reset token",
        "POST /api/auth/reset-password/:token": "Reset password",
      },
      door: {
        "GET /api/door/log-aktivitas": "Get recent activity logs",
        "GET /api/door/history": "Get activity history with date filter",
        "GET /api/door/status": "Get door status",
      },
      hardware: {
        "POST /api/hardware/rfid-scan": "Handle RFID card scan",
        "POST /api/hardware/vibration-alert": "Handle vibration sensor alert",
        "POST /api/hardware/heartbeat": "Device heartbeat",
        "GET /api/hardware/door-command/:deviceId": "Get pending commands",
      },
      cards: {
        "GET /api/cards": "Get all cards (with filtering)",
        "GET /api/cards/stats": "Get card statistics",
        "POST /api/cards": "Add new card",
        "PUT /api/cards/:id": "Update card",
        "DELETE /api/cards/:id": "Delete card",
        "PATCH /api/cards/:id/toggle": "Toggle card status",
      },
      remote: {
        "POST /api/remote/door-command": "Send remote command to device",
        "GET /api/remote/device-status/:deviceId": "Get device status",
      },
      websocket: {
        "GET /api/websocket/stats": "WebSocket connection statistics",
      },
    },
    websocket: {
      url: `ws://localhost:${process.env.PORT || 3000}`,
      description: "Real-time updates for door activities and device status",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint tidak ditemukan!",
    availableEndpoints: "/api for documentation",
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔒 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🚪 Door endpoints: http://localhost:${PORT}/api/door`);
  console.log(`🔧 Hardware endpoints: http://localhost:${PORT}/api/hardware`);
  console.log(`💳 Card endpoints: http://localhost:${PORT}/api/cards`);
  console.log(`🎮 Remote endpoints: http://localhost:${PORT}/api/remote`);
  console.log(`🌐 WebSocket server: ws://localhost:${PORT}`);
  console.log(`✅ CORS enabled for multiple origins`);
  console.log(`📡 WebSocket clients: ${socketManager.getStats().total}`);
});
