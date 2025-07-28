require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const doorRoutes = require("./routes/doorRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration - PERBAIKAN UTAMA
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
    // Tambah origin Live Server VS Code
    "null", // untuk file:// protocol
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Static files (jika diperlukan)
app.use("/static", express.static(path.join(__dirname, "../frontend/public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/door", doorRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Door API Active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔒 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🚪 Door endpoints: http://localhost:${PORT}/api/door`);
  console.log(`✅ CORS enabled for multiple origins`);
});
