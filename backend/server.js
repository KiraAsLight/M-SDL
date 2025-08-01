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
const cardRoutes = require("./routes/cardRoutes");

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
app.use("/api/cards", cardRoutes);

// Remote control endpoints (consolidated and improved)
const hardwareController = require("./controllers/hardwareController");

// Send command to device
app.post("/api/remote/door-command", hardwareController.sendDoorCommand);

// Get device status
app.get(
  "/api/remote/device-status/:deviceId?",
  hardwareController.getDeviceStatus
);

// Additional door statistics endpoint
app.get(
  "/api/door/statistics",
  require("./controllers/doorController").getActivityStats
);

// WebSocket stats endpoint
app.get("/api/websocket/stats", (req, res) => {
  res.json(socketManager.getStats());
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Door Lock API Active",
    version: "1.0.1",
    timestamp: new Date().toISOString(),
    websocket: socketManager.getStats(),
    cors: "enabled",
    database: process.env.DB_NAME,
    environment: process.env.NODE_ENV || "development",
  });
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Smart Door Lock API",
    version: "1.0.1",
    description:
      "Complete API for Smart Door Lock System with RFID access control",
    endpoints: {
      auth: {
        "POST /api/auth/login": "User login with JWT token",
        "POST /api/auth/request-reset": "Request password reset token",
        "GET /api/auth/reset-password/:token": "Validate reset token",
        "POST /api/auth/reset-password/:token": "Reset password with token",
      },
      door: {
        "GET /api/door/log-aktivitas": "Get recent activity logs (last 10)",
        "GET /api/door/history": "Get activity history with date filter",
        "GET /api/door/status": "Get door and device status",
        "GET /api/door/statistics": "Get detailed activity statistics",
      },
      hardware: {
        "POST /api/hardware/rfid-scan": "Handle RFID card scan from Arduino",
        "POST /api/hardware/vibration-alert": "Handle vibration sensor alerts",
        "POST /api/hardware/heartbeat": "Device heartbeat and status update",
        "GET /api/hardware/door-command/:deviceId":
          "Get pending commands for device",
      },
      cards: {
        "GET /api/cards": "Get all authorized cards (with filtering)",
        "GET /api/cards/stats": "Get card statistics",
        "GET /api/cards/card/:card_id": "Get specific card by card_id",
        "POST /api/cards": "Add new authorized card",
        "PUT /api/cards/:id": "Update existing card",
        "DELETE /api/cards/:id": "Delete card",
        "PATCH /api/cards/:id/toggle": "Toggle card active/inactive status",
      },
      remote: {
        "POST /api/remote/door-command": "Send remote command to device",
        "GET /api/remote/device-status/:deviceId": "Get detailed device status",
      },
      websocket: {
        "GET /api/websocket/stats": "WebSocket connection statistics",
      },
    },
    websocket: {
      url: `ws://localhost:${process.env.PORT || 3000}`,
      description:
        "Real-time updates for door activities, device status, and alerts",
      clientTypes: ["web", "arduino"],
      messageTypes: [
        "RFID_ACCESS",
        "VIBRATION_ALERT",
        "DEVICE_STATUS",
        "DOOR_COMMAND",
        "WEB_CLIENT_REGISTER",
        "ARDUINO_CLIENT_REGISTER",
      ],
    },
    database: {
      name: process.env.DB_NAME,
      tables: [
        "admin",
        "authorized_cards",
        "log_aktivitas",
        "device_status",
        "door_commands",
        "kartu",
      ],
    },
  });
});

// Test endpoint for debugging
app.get("/api/test/db", async (req, res) => {
  try {
    const db = require("./config/db");
    const [result] = await db.execute("SELECT 1 as test");
    res.json({
      database: "connected",
      test: result[0].test,
      database_name: process.env.DB_NAME,
    });
  } catch (error) {
    res.status(500).json({
      database: "error",
      message: error.message,
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint tidak ditemukan!",
    availableEndpoints: "/api for documentation",
    requestedPath: req.originalUrl,
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔐 Database: ${process.env.DB_NAME}`);
  console.log(`🔒 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🚪 Door endpoints: http://localhost:${PORT}/api/door`);
  console.log(`🔧 Hardware endpoints: http://localhost:${PORT}/api/hardware`);
  console.log(`💳 Card endpoints: http://localhost:${PORT}/api/cards`);
  console.log(`🎮 Remote endpoints: http://localhost:${PORT}/api/remote`);
  console.log(`🌐 WebSocket server: ws://localhost:${PORT}`);
  console.log(`✅ CORS enabled for multiple origins`);
  console.log(`📡 WebSocket clients: ${socketManager.getStats().total}`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
