<<<<<<< HEAD
// Global variables untuk charts
let weeklyChart = null;
let statusChart = null;

// Logout: hapus token/localStorage lalu redirect
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
=======
// Logout: hapus token/localStorage lalu redirect
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token"); // opsional, tergantung metode login lo
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
  window.location.href = "./login.html";
});

document.addEventListener("DOMContentLoaded", () => {
<<<<<<< HEAD
  // Cek autentikasi
  checkAuthentication();

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
  // Gunakan endpoint yang ada: /api/door/log-aktivitas
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
=======
  fetchDoorStatus();
});

function fetchDoorStatus() {
  fetch("http://localhost:3000/api/door/status")
    .then((response) => response.json())
    .then((data) => {
      const statusPintuEl = document.getElementById("statusPintu");
      const waktuEl = document.getElementById("doorTime");
      const aksesHariIniEl = document.getElementById("aksesHariIni");

      // Format waktu
      if (data.status_pintu && data.waktu_akses) {
        const waktu = new Date(data.waktu_akses);
        const waktuFormatted = waktu.toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        });

        statusPintuEl.textContent = data.status_pintu;
        waktuEl.textContent = waktuFormatted;
      } else {
        statusPintuEl.textContent = "Tidak Diketahui";
        waktuEl.textContent = "---";
      }

      aksesHariIniEl.textContent = data.total_akses_hari_ini || 0;
    })
    .catch((error) => {
      console.error("Gagal ambil status pintu:", error);
      document.getElementById("statusPintu").textContent = "Error";
      document.getElementById("doorTime").textContent = "Gagal ambil data";
      document.getElementById("aksesHariIni").textContent = "Error";
    });
}
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
