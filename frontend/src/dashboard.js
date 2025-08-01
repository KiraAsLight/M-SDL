// ============================================================================
// UPDATED DASHBOARD.JS - English Field Names
// frontend/src/dashboard.js
// ============================================================================

// Global variables untuk charts dan WebSocket
let weeklyChart = null;
let statusChart = null;
let websocket = null;

// API Base URL
const API_BASE = "http://localhost:3000/api";
const WS_URL = "ws://localhost:3000";
const DEVICE_ID = "MAIN_DOOR";

// Logout: hapus token/localStorage lalu redirect
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (websocket) {
    websocket.close();
  }
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  window.location.href = "./login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  // Cek autentikasi
  checkAuthentication();

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
    // Refresh device status untuk sinkronisasi dengan remote control
    loadDeviceStatus();
  }, 30000);

  // WebSocket heartbeat (ping every 30 seconds)
  setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({ type: "PING" }));
    }
  }, 30000);
});

function checkAuthentication() {
  const token = localStorage.getItem("authToken");
  const userEmail = localStorage.getItem("userEmail");

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  // Tampilkan email user
  if (userEmail) {
    const userEmailEl = document.getElementById("userEmail");
    if (userEmailEl) {
      userEmailEl.textContent = userEmail;
    }
  }
}

// WebSocket functions
function initWebSocket() {
  try {
    websocket = new WebSocket(WS_URL);

    websocket.onopen = () => {
      console.log("WebSocket connected to dashboard");
      websocket.send(
        JSON.stringify({
          type: "WEB_CLIENT_REGISTER",
          clientId: "dashboard",
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

// Handle WebSocket messages
function handleWebSocketMessage(data) {
  switch (data.type) {
    case "RFID_ACCESS":
      handleRFIDAccess(data);
      break;
    case "VIBRATION_ALERT":
      handleVibrationAlert(data);
      break;
    case "DEVICE_STATUS":
      handleDeviceStatus(data);
      break;
    case "DOOR_COMMAND_RESPONSE":
      handleCommandResponse(data);
      break;
    case "REGISTRATION_SUCCESS":
      console.log("Dashboard WebSocket registration successful");
      break;
    case "PONG":
      // Handle ping-pong
      break;
    default:
      console.log("Unknown WebSocket message:", data);
  }
}

// Handle real-time RFID access - UPDATED FOR ENGLISH FIELDS
function handleRFIDAccess(data) {
  // Show real-time notification
  showNotification(
    `RFID Access: ${data.userName} - ${data.status}`,
    data.status === "berhasil" ? "success" : "error"
  );

  // Update dashboard data
  fetchDashboardData();
  fetchRecentActivity();

  // Update charts if needed
  if (isToday(data.timestamp)) {
    fetchWeeklyData();
  }

  // Update door status based on access
  updateDoorStatusFromAccess(data);
}

// Handle vibration alerts
function handleVibrationAlert(data) {
  const alertLevel = data.alertLevel.toLowerCase();
  let type = "warning";

  if (alertLevel === "high") {
    type = "error";
    showCriticalAlert(data.message);
  }

  showNotification(`Security Alert: ${data.message}`, type);
}

// Handle device status updates
function handleDeviceStatus(data) {
  updateDeviceStatusDisplay(data);
}

// Handle command responses
function handleCommandResponse(data) {
  if (data.success) {
    showNotification(data.message || "Command executed successfully", "success");
    // Refresh door status after command
    setTimeout(() => {
      loadDeviceStatus();
      fetchDashboardData();
    }, 1000);
  } else {
    showNotification(data.message || "Command failed", "error");
  }
}

// Update device status display - FIXED FUNCTION
function updateDeviceStatusDisplay(data) {
  // Update door status (simplified logic)
  const statusPintuEl = document.getElementById("statusPintu");
  const doorStatusIcon = document.getElementById("doorStatusIcon");
  const deviceLastUpdate = document.getElementById("deviceLastUpdate");
  const deviceStatusText = document.getElementById("deviceStatusText");
  const deviceHeartbeat = document.getElementById("deviceHeartbeat");

  if (statusPintuEl && doorStatusIcon) {
    const isOnline = data.status === "online" || data.isOnline;

    if (isOnline) {
      statusPintuEl.textContent = "Terkunci";
      statusPintuEl.className = "text-2xl font-bold text-red-600";
      doorStatusIcon.textContent = "🔒";
    } else {
      statusPintuEl.textContent = "Offline";
      statusPintuEl.className = "text-2xl font-bold text-gray-600";
      doorStatusIcon.textContent = "📵";
    }

    if (deviceLastUpdate) {
      deviceLastUpdate.textContent = data.lastHeartbeat
        ? `Updated: ${new Date(data.lastHeartbeat).toLocaleString("id-ID")}`
        : "Never connected";
    }
  }

  // Update device connection status indicators
  if (deviceStatusText) {
    const isOnline = data.status === "online" || data.isOnline;

    if (isOnline) {
      deviceStatusText.textContent = "ONLINE";
      deviceStatusText.className = "font-semibold text-green-600";
    } else {
      deviceStatusText.textContent = "OFFLINE";
      deviceStatusText.className = "font-semibold text-red-600";
    }
  }

  if (deviceHeartbeat) {
    if (data.lastHeartbeat) {
      const timeDiff = data.timeSinceLastHeartbeat || 0;
      if (timeDiff < 60) {
        deviceHeartbeat.textContent = `${timeDiff}s ago`;
      } else if (timeDiff < 3600) {
        deviceHeartbeat.textContent = `${Math.floor(timeDiff / 60)}m ago`;
      } else {
        deviceHeartbeat.textContent = `${Math.floor(timeDiff / 3600)}h ago`;
      }
    } else {
      deviceHeartbeat.textContent = "Never";
    }
  }

  // Update connection status
  updateConnectionStatus(data.status === "online" || data.isOnline);
}

// Load device status (sinkronisasi dengan remote control)
async function loadDeviceStatus() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/remote/device-status/${DEVICE_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    updateDoorStatusFromDevice(data);
  } catch (error) {
    console.error("Error loading device status:", error);
    // Set default offline status
    updateDoorStatusFromDevice({
      status: "offline",
      lastHeartbeat: null,
      isOnline: false,
    });
  }
}

// Update door status dari device status (seperti di remote control)
function updateDoorStatusFromDevice(data) {
  const statusPintuEl = document.getElementById("statusPintu");
  const doorStatusIcon = document.getElementById("doorStatusIcon");
  const deviceLastUpdate = document.getElementById("deviceLastUpdate");
  
  if (!statusPintuEl || !doorStatusIcon) return;

  const isOnline = data.status === "online" || data.isOnline;

  if (isOnline) {
    statusPintuEl.textContent = "Terkunci";
    statusPintuEl.className = "text-2xl font-bold text-red-600";
    doorStatusIcon.textContent = "🔒";
  } else {
    statusPintuEl.textContent = "Offline";
    statusPintuEl.className = "text-2xl font-bold text-gray-600";
    doorStatusIcon.textContent = "📵";
  }

  if (deviceLastUpdate) {
    deviceLastUpdate.textContent = data.lastHeartbeat
      ? `Updated: ${new Date(data.lastHeartbeat).toLocaleString("id-ID")}`
      : "Never connected";
  }

  // Update connection status indicator
  updateConnectionStatus(isOnline);
}

// Update door status from access event
function updateDoorStatusFromAccess(data) {
  const statusPintuEl = document.getElementById("statusPintu");
  const doorStatusIcon = document.getElementById("doorStatusIcon");
  
  if (!statusPintuEl || !doorStatusIcon) return;

  if (data.status === "berhasil") {
    // Temporarily show "Terbuka" then back to "Terkunci"
    statusPintuEl.textContent = "Terbuka";
    statusPintuEl.className = "text-2xl font-bold text-green-600";
    doorStatusIcon.textContent = "🔓";

    // After 3 seconds, set back to locked
    setTimeout(() => {
      statusPintuEl.textContent = "Terkunci";
      statusPintuEl.className = "text-2xl font-bold text-red-600";
      doorStatusIcon.textContent = "🔒";
    }, 3000);
  }
}

// Fetch data untuk cards di atas (menggunakan endpoint history untuk konsistensi)
async function fetchDashboardData() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    // Ambil data history 30 hari terakhir untuk akurasi
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const response = await fetch(
      `${API_BASE}/door/history?mulai=${startDate}&sampai=${endDate}`,
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
    updateDashboardCards(data);
  } catch (error) {
    console.error("Gagal ambil data dashboard:", error);
    showError("dashboard");
  }
}

// UPDATED FOR ENGLISH FIELD NAMES
function updateDashboardCards(data) {
  const waktuEl = document.getElementById("doorTime");
  const aksesHariIniEl = document.getElementById("aksesHariIni");

  if (data && data.length > 0) {
    // Ambil data terbaru (berdasarkan created_at)
    const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestLog = sortedData[0];

    // Format waktu dari log terbaru
    const waktu = new Date(latestLog.created_at);
    const waktuFormatted = waktu.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

    if (waktuEl) {
      waktuEl.textContent = waktuFormatted;
    }

    // Hitung akses hari ini
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const aksesHariIni = data.filter((log) => {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];
      return logDate === todayString;
    }).length;

    if (aksesHariIniEl) {
      aksesHariIniEl.textContent = aksesHariIni;
    }
  } else {
    if (waktuEl) {
      waktuEl.textContent = "Belum ada aktivitas";
    }
    if (aksesHariIniEl) {
      aksesHariIniEl.textContent = "0";
    }
  }

  // Load device status untuk status pintu
  loadDeviceStatus();
}

// Fetch data untuk grafik mingguan (menggunakan endpoint history)
async function fetchWeeklyData() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    // Ambil data 7 hari terakhir
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const response = await fetch(
      `${API_BASE}/door/history?mulai=${startDateStr}&sampai=${endDateStr}`,
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
    createWeeklyChart(data);
    createStatusChart(data);
  } catch (error) {
    console.error("Gagal ambil data mingguan:", error);
  }
}

function createWeeklyChart(data) {
  const ctx = document.getElementById("weeklyChart");
  if (!ctx) return;

  // Destroy chart yang sudah ada
  if (weeklyChart) {
    weeklyChart.destroy();
  }

  // Proses data untuk 7 hari terakhir
  const last7Days = [];
  const accessCounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
    last7Days.push(dayName);

    const count = data.filter((log) => {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];
      return logDate === dateStr;
    }).length;

    accessCounts.push(count);
  }

  weeklyChart = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels: last7Days,
      datasets: [
        {
          label: "Jumlah Akses",
          data: accessCounts,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// UPDATED FOR ENGLISH FIELD NAMES
function createStatusChart(data) {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;

  // Destroy chart yang sudah ada
  if (statusChart) {
    statusChart.destroy();
  }

  // Hitung status hari ini (menggunakan data dari history)
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.filter((log) => {
    const logDate = new Date(log.created_at).toISOString().split("T")[0];
    return logDate === today;
  });

  const berhasil = todayData.filter((log) => {
    const status = (log.status || "").toLowerCase();
    const description = (log.description || "").toLowerCase(); // UPDATED FIELD NAME
    return status === "berhasil" || description.includes("berhasil");
  }).length;

  const gagal = todayData.filter((log) => {
    const status = (log.status || "").toLowerCase();
    const description = (log.description || "").toLowerCase(); // UPDATED FIELD NAME
    return status === "gagal" || description.includes("gagal") || description.includes("ditolak");
  }).length;

  const pending = todayData.filter((log) => {
    const status = (log.status || "").toLowerCase();
    return status === "pending";
  }).length;

  // Jika tidak ada data hari ini, tampilkan chart kosong
  if (todayData.length === 0) {
    statusChart = new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Tidak ada data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["rgba(156, 163, 175, 0.8)"],
            borderColor: ["rgb(156, 163, 175)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
        },
      },
    });
    return;
  }

  statusChart = new Chart(ctx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Berhasil", "Gagal", "Pending"],
      datasets: [
        {
          data: [berhasil, gagal, pending],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(251, 191, 36, 0.8)",
          ],
          borderColor: [
            "rgb(34, 197, 94)",
            "rgb(239, 68, 68)",
            "rgb(251, 191, 36)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  });
}

// Fetch aktivitas terbaru (menggunakan endpoint log-aktivitas)
async function fetchRecentActivity() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/door/log-aktivitas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    renderRecentActivity(data.slice(0, 5)); // Ambil 5 terbaru
  } catch (error) {
    console.error("Gagal ambil aktivitas terbaru:", error);
  }
}

// UPDATED FOR ENGLISH FIELD NAMES
function renderRecentActivity(data) {
  const tbody = document.getElementById("recentActivityBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-gray-500">Belum ada aktivitas</td>
      </tr>
    `;
    return;
  }

  data.forEach((log) => {
    const waktu = new Date(log.created_at);
    const waktuStr = waktu.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    const status = log.status || "unknown";
    let statusClass = "bg-gray-100 text-gray-800";

    if (status.toLowerCase() === "berhasil") {
      statusClass = "bg-green-100 text-green-800";
    } else if (status.toLowerCase() === "gagal") {
      statusClass = "bg-red-100 text-red-800";
    } else if (status.toLowerCase() === "pending") {
      statusClass = "bg-yellow-100 text-yellow-800";
    }

    const row = `
      <tr class="hover:bg-gray-50">
        <td class="p-3">${waktuStr}</td>
        <td class="p-3">${log.user_name || "N/A"}</td>
        <td class="p-3">${log.card_id || "N/A"}</td>
        <td class="p-3">
          <span class="inline-block px-2 py-1 text-xs font-medium ${statusClass} rounded-full">
            ${status}
          </span>
        </td>
        <td class="p-3">
          <button 
            onclick="viewLogDetail('${log.id_log}')"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View
          </button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

// View log detail function
function viewLogDetail(logId) {
  // Redirect to history page with specific log
  window.location.href = `history.html#log-${logId}`;
}

// Utility functions
function updateConnectionStatus(connected) {
  // Update connection indicator in header jika ada
  const connectionStatus = document.getElementById("connectionStatus");
  if (connectionStatus) {
    if (connected) {
      connectionStatus.innerHTML =
        '<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span class="text-green-600 text-sm">Live</span>';
    } else {
      connectionStatus.innerHTML =
        '<span class="w-2 h-2 bg-red-500 rounded-full"></span><span class="text-red-600 text-sm">Offline</span>';
    }
  }
}

function isToday(timestamp) {
  if (!timestamp) return false;
  const today = new Date().toDateString();
  const checkDate = new Date(timestamp).toDateString();
  return today === checkDate;
}

function showError(section) {
  if (section === "dashboard") {
    const statusPintuEl = document.getElementById("statusPintu");
    const doorTimeEl = document.getElementById("doorTime");
    const aksesHariIniEl = document.getElementById("aksesHariIni");
    const doorStatusIcon = document.getElementById("doorStatusIcon");

    if (statusPintuEl) {
      statusPintuEl.textContent = "Error";
      statusPintuEl.className = "text-2xl font-bold text-red-600";
    }
    if (doorStatusIcon) {
      doorStatusIcon.textContent = "❌";
    }
    if (doorTimeEl) {
      doorTimeEl.textContent = "Gagal ambil data";
    }
    if (aksesHariIniEl) {
      aksesHariIniEl.textContent = "Error";
    }
  }
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

// Global functions for debugging
window.dashboardDebug = {
  refreshDeviceStatus: loadDeviceStatus,
  fetchDashboardData,
  fetchWeeklyData,
  fetchRecentActivity,
  updateDeviceStatusDisplay,
  websocket
};