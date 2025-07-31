document.addEventListener("DOMContentLoaded", () => {
  const logTableBody = document.getElementById("logTableBody");
  const filterForm = document.getElementById("filterForm");

  // Fungsi untuk ambil semua data log (tanpa filter)
  async function fetchAllLogs() {
    const endpoint = "http://localhost:3000/api/door/log-aktivitas";

    try {
      const response = await fetch(endpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      renderLogsToTable(data);
    } catch (error) {
      console.error("Gagal ambil data log aktivitas:", error.message);
      showErrorMessage("Gagal memuat data");
    }
  }

  // Fungsi untuk ambil data berdasarkan filter tanggal
  async function fetchFilteredLogs(startDate, endDate) {
    const endpoint = `http://localhost:3000/api/door/history?mulai=${startDate}&sampai=${endDate}`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      renderLogsToTable(data);
    } catch (error) {
      console.error("Gagal ambil data history:", error.message);
      showErrorMessage("Gagal memuat data filter");
    }
  }

  // Fungsi untuk render data ke tabel
  function renderLogsToTable(data) {
    logTableBody.innerHTML = ""; // Clear isi tabel

    if (data.length === 0) {
      logTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-gray-500">Tidak ada data ditemukan</td>
        </tr>
      `;
      return;
    }

    data.forEach((log, index) => {
      const createdAt = new Date(log.created_at);
      const tanggal = createdAt.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const jam = createdAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const row = `
        <tr class="hover:bg-gray-50">
          <td class="p-4 text-center">${index + 1}</td>
          <td class="p-4 text-center">${log.kartu_id}</td>
          <td class="p-4 text-center">${log.pengguna}</td>
          <td class="p-4 text-center">${tanggal}</td>
          <td class="p-4 text-center">${jam}</td>
        </tr>
      `;
      logTableBody.insertAdjacentHTML("beforeend", row);
    });
  }

  // Fungsi untuk menampilkan pesan error
  function showErrorMessage(message) {
    logTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-red-500">${message}</td>
      </tr>
    `;
  }

  // Event listener untuk form filter
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    console.log("Filter dates:", startDate, endDate); // Debug log

    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal mulai dan tanggal akhir!");
      return;
    }

    if (startDate > endDate) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir!");
      return;
    }

    // Panggil fungsi filter
    await fetchFilteredLogs(startDate, endDate);
  });

  // Event listener untuk logout button
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  });

  // Load semua data saat halaman pertama kali dibuka
  fetchAllLogs();
});
