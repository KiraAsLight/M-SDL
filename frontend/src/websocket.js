// Global variables untuk charts dan WebSocket
let weeklyChart = null;
let statusChart = null;
let websocket = null;

// WebSocket connection
function initWebSocket() {
  const wsUrl = `ws://localhost:3000`;
  websocket = new WebSocket(wsUrl);

  websocket.onopen = () => {
    console.log("WebSocket connected");
    // Register as web client
    websocket.send(
      JSON.stringify({
        type: "WEB_CLIENT_REGISTER",
        clientId: "dashboard",
      })
    );

    // Update connection status
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
    case "REGISTRATION_SUCCESS":
      console.log("WebSocket registration successful");
      break;
    case "PONG":
      // Handle ping-pong
      break;
    default:
      console.log("Unknown WebSocket message:", data);
  }
}

// Handle real-time RFID access
function handleRFIDAccess(data) {
  // Show real-time notification
  showNotification(
    `${data.userName} - ${data.status}`,
    data.status === "berhasil" ? "success" : "error"
  );

  // Update dashboard data
  fetchDashboardData();
  fetchRecentActivity();

  // Update charts if needed
  if (isToday(data.timestamp)) {
    fetchWeeklyData();
  }
}

// Handle vibration alerts
function handleVibrationAlert(data) {
  const alertLevel = data.alertLevel.toLowerCase();
  let type = "warning";

  if (alertLevel === "high") {
    type = "error";
    // Show critical alert modal or sound
    showCriticalAlert(data.message);
  }

  showNotification(data.message, type);
}

// Handle device status updates
function handleDeviceStatus(data) {
  updateDeviceStatusDisplay(data);
}

// Show notifications
function showNotification(message, type = "info") {
  // Create notification element
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

// Show critical alert modal
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

// Update connection status indicator
function updateConnectionStatus(connected) {
  const statusEl = document.getElementById("connectionStatus");
  if (!statusEl) {
    // Create status indicator if it doesn't exist
    const header = document.querySelector("header");
    const statusDiv = document.createElement("div");
    statusDiv.id = "connectionStatus";
    statusDiv.className = "flex items-center gap-2 text-sm";
    header.appendChild(statusDiv);
  }

  const statusElement = document.getElementById("connectionStatus");
  if (connected) {
    statusElement.innerHTML =
      '<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span class="text-green-600">Live</span>';
  } else {
    statusElement.innerHTML =
      '<span class="w-2 h-2 bg-red-500 rounded-full"></span><span class="text-red-600">Offline</span>';
  }
}

// Update device status display
function updateDeviceStatusDisplay(data) {
  const deviceStatusEl = document.getElementById("deviceStatus");
  if (deviceStatusEl) {
    const statusClass =
      data.status === "online" ? "text-green-600" : "text-red-600";
    deviceStatusEl.innerHTML = `<span class="${statusClass}">${data.status.toUpperCase()}</span>`;
  }
}

// Check if timestamp is today
function isToday(timestamp) {
  const today = new Date().toDateString();
  const checkDate = new Date(timestamp).toDateString();
  return today === checkDate;
}

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

  // Refresh data setiap 30 detik (as backup to WebSocket)
  setInterval(() => {
    fetchDashboardData();
    fetchRecentActivity();
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
    document.getElementById("userEmail").textContent = userEmail;
  }
}

// Fetch data untuk cards di atas
function fetchDashboardData() {
  fetch("http://localhost:3000/api/door/log-aktivitas", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateDashboardCards(data);
    })
    .catch((error) => {
      console.error("Gagal ambil data dashboard:", error);
      showError("dashboard");
    });
}

function updateDashboardCards(data) {
  const statusPintuEl = document.getElementById("statusPintu");
  const waktuEl = document.getElementById("doorTime");
  const aksesHariIniEl = document.getElementById("aksesHariIni");

  if (data && data.length > 0) {
    // Ambil data terbaru (index 0 karena sudah diurutkan DESC)
    const latestLog = data[0];

    // Format waktu dari log terbaru
    const waktu = new Date(latestLog.created_at);
    const waktuFormatted = waktu.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

    // Set status pintu berdasarkan aktivitas terbaru
    statusPintuEl.textContent = "Tertutup";
    statusPintuEl.className = "text-2xl font-bold text-green-600 mt-1";
    waktuEl.textContent = waktuFormatted;

    // Hitung akses hari ini
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const aksesHariIni = data.filter((log) => {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];
      return logDate === todayString;
    }).length;

    aksesHariIniEl.textContent = aksesHariIni;
  } else {
    statusPintuEl.textContent = "Tidak Diketahui";
    statusPintuEl.className = "text-2xl font-bold text-gray-500 mt-1";
    waktuEl.textContent = "Belum ada aktivitas";
    aksesHariIniEl.textContent = "0";
  }
}

// Fetch data untuk grafik mingguan
function fetchWeeklyData() {
  // Ambil data 7 hari terakhir
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  fetch(
    `http://localhost:3000/api/door/history?mulai=${startDateStr}&sampai=${endDateStr}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      createWeeklyChart(data);
      createStatusChart(data);
    })
    .catch((error) => {
      console.error("Gagal ambil data mingguan:", error);
    });
}

function createWeeklyChart(data) {
  const ctx = document.getElementById("weeklyChart").getContext("2d");

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

  weeklyChart = new Chart(ctx, {
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

function createStatusChart(data) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  // Destroy chart yang sudah ada
  if (statusChart) {
    statusChart.destroy();
  }

  // Hitung status hari ini
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.filter((log) => {
    const logDate = new Date(log.created_at).toISOString().split("T")[0];
    return logDate === today;
  });

  const berhasil = todayData.filter(
    (log) =>
      (log.status && log.status.toLowerCase() === "berhasil") ||
      (log.keterangan && log.keterangan.toLowerCase().includes("berhasil"))
  ).length;

  const gagal = todayData.filter(
    (log) =>
      (log.status && log.status.toLowerCase() === "gagal") ||
      (log.keterangan && log.keterangan.toLowerCase().includes("gagal"))
  ).length;

  const lainnya = todayData.length - berhasil - gagal;

  statusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Berhasil", "Gagal", "Lainnya"],
      datasets: [
        {
          data: [berhasil, gagal, lainnya],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(156, 163, 175, 0.8)",
          ],
          borderColor: [
            "rgb(34, 197, 94)",
            "rgb(239, 68, 68)",
            "rgb(156, 163, 175)",
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

// Fetch aktivitas terbaru
function fetchRecentActivity() {
  fetch("http://localhost:3000/api/door/log-aktivitas", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      renderRecentActivity(data.slice(0, 5)); // Ambil 5 terbaru
    })
    .catch((error) => {
      console.error("Gagal ambil aktivitas terbaru:", error);
    });
}

function renderRecentActivity(data) {
  const tbody = document.getElementById("recentActivityBody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-4 text-center text-gray-500">Belum ada aktivitas</td>
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
    }

    const row = `
      <tr class="hover:bg-gray-50">
        <td class="p-3">${waktuStr}</td>
        <td class="p-3">${log.pengguna || "N/A"}</td>
        <td class="p-3">${log.kartu_id || "N/A"}</td>
        <td class="p-3">
          <span class="inline-block px-2 py-1 text-xs font-medium ${statusClass} rounded-full">
            ${status}
          </span>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function showError(section) {
  if (section === "dashboard") {
    document.getElementById("statusPintu").textContent = "Error";
    document.getElementById("doorTime").textContent = "Gagal ambil data";
    document.getElementById("aksesHariIni").textContent = "Error";
  }
}
