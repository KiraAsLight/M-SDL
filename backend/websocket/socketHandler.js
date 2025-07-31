// backend/websocket/socketHandler.js
const WebSocket = require("ws");

class SocketManager {
  constructor() {
    this.webClients = new Set(); // Web browser clients
    this.arduinoClients = new Set(); // Arduino/ESP clients
  }

  // Initialize WebSocket server
  init(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", (ws, req) => {
      console.log("New WebSocket connection");

      // Handle different client types
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        this.webClients.delete(ws);
        this.arduinoClients.delete(ws);
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });
  }

  // Handle incoming messages
  handleMessage(ws, data) {
    switch (data.type) {
      case "WEB_CLIENT_REGISTER":
        this.webClients.add(ws);
        ws.clientType = "web";
        ws.send(
          JSON.stringify({
            type: "REGISTRATION_SUCCESS",
            message: "Web client registered",
          })
        );
        break;

      case "ARDUINO_CLIENT_REGISTER":
        this.arduinoClients.add(ws);
        ws.clientType = "arduino";
        ws.deviceId = data.deviceId || "UNKNOWN";
        ws.send(
          JSON.stringify({
            type: "REGISTRATION_SUCCESS",
            message: "Arduino client registered",
          })
        );
        break;

      case "PING":
        ws.send(JSON.stringify({ type: "PONG" }));
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }

  // Broadcast to all web clients
  broadcastToWebClients(data) {
    const message = JSON.stringify(data);
    this.webClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast to all Arduino clients
  broadcastToArduinoClients(data) {
    const message = JSON.stringify(data);
    this.arduinoClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send to specific Arduino device
  sendToDevice(deviceId, data) {
    const message = JSON.stringify(data);
    this.arduinoClients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.deviceId === deviceId
      ) {
        client.send(message);
      }
    });
  }

  // Get connected clients count
  getStats() {
    return {
      webClients: this.webClients.size,
      arduinoClients: this.arduinoClients.size,
      total: this.webClients.size + this.arduinoClients.size,
    };
  }
}

// Export singleton instance
const socketManager = new SocketManager();
module.exports = socketManager;
