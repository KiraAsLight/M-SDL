// Contoh integrasi Device Status Service ke dashboard.js yang sudah ada
// Tambahkan kode ini ke bagian atas dashboard.js setelah variabel global

// ============================================================================
// DEVICE STATUS SERVICE INTEGRATION
// ============================================================================

// Initialize device status service
let deviceStatusService = null;

// Initialize pada DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Existing initialization code...
  checkAuthentication();

  // Initialize Device Status Service
  initializeDeviceStatusService();

  // Initialize WebSocket
  initWebSocket();

  // Load dashboard data
  fetchDashboardData();
  fetchWeeklyData();
  fetchRecentActivity();

  // Refresh data setiap 30 detik
  setInterval(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, 30000);
});

// Device Status Service Initialization
function initializeDeviceStatusService() {
  if (window.DeviceStatusService) {
    deviceStatusService = new window.DeviceStatusService();
    
    // Subscribe to status updates
    deviceStatusService.onStatusUpdate((status) => {
      updateDashboardFromDeviceStatus(status);
    });

    // Start periodic updates
    deviceStatusService.startPeriodicUpdates(30000); // 30 seconds
  } else {
    console.warn("DeviceStatusService not available, using fallback");
  }
}

// Update dashboard elements from device status
function updateDashboardFromDeviceStatus(status) {
  // Update status pintu
  updateDoorStatusDisplay(status);
  
  // Update device indicators
  updateDeviceIndicators(status);
  
  // Update connection status
  updateConnectionStatusFromDevice(status);
}

// Update door status display
function updateDoorStatusDisplay(status) {
  const statusPintuEl = document.getElementById("statusPintu");
  const doorStatusIcon = document.getElementById("doorStatusIcon");
  const deviceLastUpdate = document.getElementById("deviceLastUpdate");
  
  if (!statusPintuEl) return;

  let displayStatus, iconText, className, lastUpdateText;

  if (status.isTemporary && status.temporaryStatus) {
    // Handle temporary status (e.g., door opened for 3 seconds)
    switch (status.temporaryStatus) {
      case "open":
        displayStatus = "Terbuka";
        iconText = "🔓";
        className = "text-2xl font-bold text-green-600";
        lastUpdateText = "Just opened";
        break;
      default:
        displayStatus = "Terkunci";
        iconText = "🔒";
        className = "text-2xl font-bold text-red-600";
        lastUpdateText = "Just locked";
    }
  } else {
    // Normal status based on device
    const doorDisplay = deviceStatusService ? 
      deviceStatusService.getDoorStatusDisplay() : 
      getDefaultDoorDisplay(status);
    
    displayStatus = doorDisplay.text;
    iconText = doorDisplay.icon;
    className = `text-2xl font-bold ${doorDisplay.className}`;
    lastUpdateText = doorDisplay.lastUpdate;
  }

  statusPintuEl.textContent = displayStatus;
  statusPintuEl.className = className;
  
  if (doorStatusIcon) {
    doorStatusIcon.textContent = iconText;
  }
  
  if (deviceLastUpdate) {
    deviceLastUpdate.textContent = lastUpdateText;
  }
}

// Update device indicators
function updateDeviceIndicators(status) {
  const deviceStatusText = document.getElementById("deviceStatusText");
  const deviceHeartbeat = document.getElementById("deviceHeartbeat");

  if (deviceStatusText) {
    const connectionStatus = deviceStatusService ? 
      deviceStatusService.getConnectionStatus() : 
      getDefaultConnectionStatus(status);
    
    deviceStatusText.textContent = connectionStatus.text;
    deviceStatusText.className = `font-semibold ${connectionStatus.className}`;
  }

  if (deviceHeartbeat) {
    const heartbeatText = deviceStatusService ? 
      deviceStatusService.getTimeSinceHeartbeat() : 
      "Unknown";
    
    deviceHeartbeat.textContent = heartbeatText;
  }
}

// Update connection status from device
function updateConnectionStatusFromDevice(status) {
  const connectionStatus = document.getElementById("connectionStatus");
  if (!connectionStatus) return;

  const isOnline = status.status === "online" || status.isOnline;
  
  if (isOnline) {
    connectionStatus.innerHTML = `
      <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      <span class="text-green-600 text-sm">Live</span>
    `;
  } else {
    connectionStatus.innerHTML = `
      <span class="w-2 h-2 bg-red-500 rounded-full"></span>
      <span class="text-red-600 text-sm">Offline</span>
    `;
  }
}

// Fallback functions when DeviceStatusService is not available
function getDefaultDoorDisplay(status) {
  if (!status) {
    return {
      text: "Unknown",
      icon: "❓",
      className: "text-gray-600",
      lastUpdate: "Never"
    };
  }

  const isOnline = status.status === "online" || status.isOnline;
  
  if (isOnline) {
    return {
      text: "Terkunci",
      icon: "🔒",
      className: "text-red-600",
      lastUpdate: status.lastHeartbeat ? 
        `Updated: ${new Date(status.lastHeartbeat).toLocaleString("id-ID")}` : 
        "Just now"
    };
  } else {
    return {
      text: "Offline",
      icon: "📵",
      className: "text-gray-600",
      lastUpdate: status.lastHeartbeat ? 
        `Last seen: ${new Date(status.lastHeartbeat).toLocaleString("id-ID")}` : 
        "Never connected"
    };
  }
}

function getDefaultConnectionStatus(status) {
  if (!status) {
    return {
      connected: false,
      text: "Unknown",
      className: "text-gray-600"
    };
  }

  const isOnline = status.status === "online" || status.isOnline;
  
  return {
    connected: isOnline,
    text: isOnline ? "Online" : "Offline",
    className: isOnline ? "text-green-600" : "text-red-600"
  };
}

// ============================================================================
// ENHANCED WEBSOCKET HANDLERS
// ============================================================================

// Enhanced RFID access handler
function handleRFIDAccess(data) {
  // Show real-time notification
  showNotification(
    `RFID Access: ${data.userName} - ${data.status}`,
    data.status === "berhasil" ? "success" : "error"
  );

  // Update temporary door status if successful
  if (data.status === "berhasil" && deviceStatusService) {
    deviceStatusService.updateDoorStatusTemporary("open", 3000);
  }

  // Update dashboard data
  fetchDashboardData();
  fetchRecentActivity();

  // Update charts if needed
  if (isToday(data.timestamp)) {
    fetchWeeklyData();
  }
}

// Enhanced device status handler
function handleDeviceStatus(data) {
  if (deviceStatusService) {
    // Let device status service handle the update
    deviceStatusService.notifyStatusUpdate(data);
  } else {
    // Fallback to direct update
    updateDashboardFromDeviceStatus(data);
  }
}

// Enhanced command response handler
function handleCommandResponse(data) {
  if (data.success) {
    showNotification(data.message || "Command executed successfully", "success");
    
    // Refresh device status after command
    setTimeout(() => {
      if (deviceStatusService) {
        deviceStatusService.getDeviceStatus();
      } else {
        loadDeviceStatus();
      }
      fetchDashboardData();
    }, 1000);
  } else {
    showNotification(data.message || "Command failed", "error");
  }
}

// ============================================================================
// CLEANUP ON PAGE UNLOAD
// ============================================================================

window.addEventListener("beforeunload", () => {
  if (deviceStatusService) {
    deviceStatusService.destroy();
  }
  
  if (websocket) {
    websocket.close();
  }
});

// ============================================================================
// EXAMPLE USAGE IN EXISTING FUNCTIONS
// ============================================================================

// Enhanced fetchDashboardData function
async function fetchDashboardDataEnhanced() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    // Use new dashboard summary endpoint for faster loading
    const response = await fetch(`${API_BASE}/door/dashboard-summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    updateDashboardCardsFromSummary(data);
    
    // Update device status if available
    if (data.device_status && deviceStatusService) {
      deviceStatusService.notifyStatusUpdate({
        ...data.device_status,
        isOnline: data.device_online
      });
    }
    
  } catch (error) {
    console.error("Gagal ambil data dashboard:", error);
    showError("dashboard");
  }
}

// Update dashboard cards from summary data
function updateDashboardCardsFromSummary(data) {
  const waktuEl = document.getElementById("doorTime");
  const aksesHariIniEl = document.getElementById("aksesHariIni");

  if (data.latest_activity && data.latest_activity.length > 0) {
    const latestLog = data.latest_activity[0];
    const waktu = new Date(latestLog.created_at);
    const waktuFormatted = waktu.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

    if (waktuEl) {
      waktuEl.textContent = waktuFormatted;
    }
  } else {
    if (waktuEl) {
      waktuEl.textContent = "Belum ada aktivitas";
    }
  }

  if (aksesHariIniEl && data.summary) {
    aksesHariIniEl.textContent = data.summary.today_total;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Check if device status service is available
function isDeviceStatusServiceAvailable() {
  return deviceStatusService !== null && typeof deviceStatusService.getDeviceStatus === 'function';
}

// Get current device status
async function getCurrentDeviceStatus() {
  if (isDeviceStatusServiceAvailable()) {
    return await deviceStatusService.getDeviceStatus();
  } else {
    return await loadDeviceStatusFallback();
  }
}

// Fallback device status loader
async function loadDeviceStatusFallback() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/remote/device-status/MAIN_DOOR`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading device status:", error);
    return null;
  }
}

// Example: Manual refresh button
function refreshDeviceStatus() {
  if (isDeviceStatusServiceAvailable()) {
    deviceStatusService.getDeviceStatus();
  } else {
    loadDeviceStatusFallback().then(status => {
      if (status) {
        updateDashboardFromDeviceStatus(status);
      }
    });
  }
  
  showNotification("Device status refreshed", "info");
}

// ============================================================================
// EXPORT FOR DEBUGGING
// ============================================================================

// Make functions available for debugging
if (typeof window !== 'undefined') {
  window.dashboardDebug = {
    deviceStatusService,
    refreshDeviceStatus,
    getCurrentDeviceStatus,
    updateDashboardFromDeviceStatus,
    isDeviceStatusServiceAvailable
  };
}