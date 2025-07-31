document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const doorStatusIcon = document.getElementById("doorStatusIcon");
  const doorStatusText = document.getElementById("doorStatusText");
  const doorLastUpdate = document.getElementById("doorLastUpdate");

  const deviceStatusIcon = document.getElementById("deviceStatusIcon");
  const deviceStatusText = document.getElementById("deviceStatusText");
  const deviceLastHeartbeat = document.getElementById("deviceLastHeartbeat");

  const vibrationValue = document.getElementById("vibrationValue");
  const wifiSignal = document.getElementById("wifiSignal");
  const deviceUptime = document.getElementById("deviceUptime");

  const connectionStatus = document.getElementById("connectionStatus");

  // Control buttons
  const unlockBtn = document.getElementById("unlockBtn");
  const lockBtn = document.getElementById("lockBtn");
  const statusBtn = document.getElementById("statusBtn");
  const resetBtn = document.getElementById("resetBtn");
  const armBtn = document.getElementById("armBtn");
  const disarmBtn = document.getElementById("disarmBtn");

  // Modal elements
  const confirmModal = document.getElementById("confirmModal");
  const confirmTitle = document.getElementById("confirmTitle");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  // Global variables
  let websocket = null;
  const API_BASE = "http://localhost:3000/api";
  const WS_URL = "ws://localhost:3000";
  const DEVICE_ID = "MAIN_DOOR";

  // Authentication check
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  // Initialize
  initWebSocket();
  loadDeviceStatus();

  // Refresh device status every 30 seconds
  setInterval(loadDeviceStatus, 30000);

  // Event Listeners
  unlockBtn.addEventListener("click", () =>
    confirmAction(
      "UNLOCK",
      "Buka Pintu",
      "Apakah Anda yakin ingin membuka pintu?"
    )
  );
  lockBtn.addEventListener("click", () =>
    confirmAction(
      "LOCK",
      "Kunci Pintu",
      "Apakah Anda yakin ingin mengunci pintu?"
    )
  );
  statusBtn.addEventListener("click", () => sendCommand("STATUS_CHECK"));
  resetBtn.addEventListener("click", () =>
    confirmAction(
      "RESET",
      "Reset Device",
      "Apakah Anda yakin ingin mereset device?"
    )
  );
  armBtn.addEventListener("click", () =>
    confirmAction(
      "ARM_SYSTEM",
      "Aktifkan Alarm",
      "Apakah Anda yakin ingin mengaktifkan sistem alarm?"
    )
  );
  disarmBtn.addEventListener("click", () =>
    confirmAction(
      "DISARM_SYSTEM",
      "Nonaktifkan Alarm",
      "Apakah Anda yakin ingin menonaktifkan sistem alarm?"
    )
  );

  confirmNo.addEventListener("click", closeModal);

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (websocket) {
      websocket.close();
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "./login.html";
  });

  // WebSocket functions
  function initWebSocket() {
    try {
      websocket = new WebSocket(WS_URL);

      websocket.onopen = () => {
        console.log("WebSocket connected to remote control");
        websocket.send(
          JSON.stringify({
            type: "WEB_CLIENT_REGISTER",
            clientId: "remote_control",
          })
        );
        updateConnectionStatus(true);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        updateConnectionStatus(false);

        // Reconnect after 3 seconds
        setTimeout(() => {
          if (!websocket || websocket.readyState === WebSocket.CLOSED) {
            initWebSocket();
          }
        }, 3000);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        updateConnectionStatus(false);
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      updateConnectionStatus(false);
    }
  }

  function handleWebSocketMessage(data) {
    switch (data.type) {
      case "DEVICE_STATUS":
        updateDeviceStatusDisplay(data);
        break;
      case "RFID_ACCESS":
        showNotification(
          `Akses RFID: ${data.userName} - ${data.status}`,
          data.status === "berhasil" ? "success" : "error"
        );
        break;
      case "VIBRATION_ALERT":
        handleVibrationAlert(data);
        break;
      case "DOOR_COMMAND_RESPONSE":
        handleCommandResponse(data);
        break;
      case "REGISTRATION_SUCCESS":
        console.log("Remote control WebSocket registered successfully");
        break;
      default:
        console.log("Unknown WebSocket message:", data);
    }
  }

  function handleVibrationAlert(data) {
    if (vibrationValue) {
      vibrationValue.textContent = data.intensity || "-";
    }

    const alertClass = data.alertLevel === "HIGH" ? "error" : "warning";
    showNotification(data.message, alertClass);

    if (data.alertLevel === "HIGH") {
      showCriticalAlert(data.message);
    }
  }

  function handleCommandResponse(data) {
    const type = data.success ? "success" : "error";
    showNotification(data.message || "Command executed", type);
  }

  function updateConnectionStatus(connected) {
    if (connectionStatus) {
      if (connected) {
        connectionStatus.innerHTML =
          '<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span class="text-green-600 text-sm">Connected</span>';
      } else {
        connectionStatus.innerHTML =
          '<span class="w-2 h-2 bg-red-500 rounded-full"></span><span class="text-red-600 text-sm">Disconnected</span>';
      }
    }
  }

  // Device status functions
  async function loadDeviceStatus() {
    try {
      const response = await fetch(
        `${API_BASE}/remote/device-status/${DEVICE_ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      updateDeviceStatusDisplay(data);
    } catch (error) {
      console.error("Error loading device status:", error);
      updateDeviceStatusDisplay({
        status: "error",
        lastHeartbeat: null,
        sensors: null,
      });
    }
  }

  function updateDeviceStatusDisplay(data) {
    // Update door status (simplified logic)
    if (doorStatusText && doorStatusIcon) {
      if (data.status === "online") {
        doorStatusText.textContent = "TERKUNCI";
        doorStatusText.className = "text-xl font-bold text-red-600 mb-2";
        doorStatusIcon.textContent = "🔒";
      } else {
        doorStatusText.textContent = "OFFLINE";
        doorStatusText.className = "text-xl font-bold text-gray-600 mb-2";
        doorStatusIcon.textContent = "❓";
      }

      if (doorLastUpdate) {
        doorLastUpdate.textContent = data.lastHeartbeat
          ? `Terakhir update: ${new Date(data.lastHeartbeat).toLocaleString(
              "id-ID"
            )}`
          : "Terakhir update: -";
      }
    }

    // Update device connection status
    if (deviceStatusText && deviceStatusIcon) {
      const isOnline = data.status === "online" || data.isOnline;

      if (isOnline) {
        deviceStatusText.textContent = "ONLINE";
        deviceStatusText.className = "text-xl font-bold text-green-600 mb-2";
        deviceStatusIcon.textContent = "📱";
      } else {
        deviceStatusText.textContent = "OFFLINE";
        deviceStatusText.className = "text-xl font-bold text-red-600 mb-2";
        deviceStatusIcon.textContent = "📵";
      }

      if (deviceLastHeartbeat) {
        deviceLastHeartbeat.textContent = data.lastHeartbeat
          ? `Heartbeat: ${Math.floor(data.timeSinceLastHeartbeat || 0)}s ago`
          : "Heartbeat: Never";
      }
    }

    // Update sensor data
    const sensors = data.sensors || {};

    if (vibrationValue) {
      vibrationValue.textContent =
        sensors.vibration !== undefined ? sensors.vibration : "-";
    }

    if (wifiSignal) {
      wifiSignal.textContent =
        sensors.wifi_signal !== undefined ? `${sensors.wifi_signal} dBm` : "-";
    }

    if (deviceUptime) {
      if (sensors.uptime !== undefined) {
        const hours = Math.floor(sensors.uptime / 3600);
        const minutes = Math.floor((sensors.uptime % 3600) / 60);
        deviceUptime.textContent = `${hours}h ${minutes}m`;
      } else {
        deviceUptime.textContent = "-";
      }
    }
  }

  // Command functions
  function confirmAction(command, title, message) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;

    confirmYes.onclick = () => {
      closeModal();
      sendCommand(command);
    };

    confirmModal.classList.remove("hidden");
  }

  function closeModal() {
    confirmModal.classList.add("hidden");
  }

  async function sendCommand(command, parameters = {}) {
    try {
      // Disable buttons during command execution
      setButtonsDisabled(true);

      const response = await fetch(`${API_BASE}/remote/door-command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command: command,
          deviceId: DEVICE_ID,
          parameters: parameters,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message, "success");

        // Refresh device status after command
        setTimeout(loadDeviceStatus, 1000);
      } else {
        showNotification(data.message || "Command failed", "error");
      }
    } catch (error) {
      console.error("Error sending command:", error);
      showNotification("Failed to send command", "error");
    } finally {
      // Re-enable buttons
      setTimeout(() => setButtonsDisabled(false), 2000);
    }
  }

  function setButtonsDisabled(disabled) {
    const buttons = [
      unlockBtn,
      lockBtn,
      statusBtn,
      resetBtn,
      armBtn,
      disarmBtn,
    ];
    buttons.forEach((btn) => {
      if (btn) {
        btn.disabled = disabled;
        if (disabled) {
          btn.classList.add("opacity-50", "cursor-not-allowed");
        } else {
          btn.classList.remove("opacity-50", "cursor-not-allowed");
        }
      }
    });
  }

  // Notification functions
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${getNotificationClass(
      type
    )}`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xl">${getNotificationIcon(type)}</span>
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg opacity-70 hover:opacity-100">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  function getNotificationClass(type) {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-yellow-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  }

  function showCriticalAlert(message) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-xl max-w-md mx-4 animate-pulse">
        <div class="text-center">
          <div class="text-6xl mb-4">🚨</div>
          <h3 class="text-xl font-bold text-red-600 mb-2">ALERT KEAMANAN!</h3>
          <p class="text-gray-700 mb-4">${message}</p>
          <button onclick="this.closest('.fixed').remove()" class="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">
            TUTUP
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Play alert sound (if available)
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmrcEzaN2e++djEGJn+M5bWLRwwaUK3kx3A"
      );
      audio.volume = 0.3;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  // Close modal when clicking outside
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
      closeModal();
    }
  });
});
