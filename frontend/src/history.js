document.addEventListener("DOMContentLoaded", () => {
  const historyTableBody = document.getElementById("historyTableBody");

<<<<<<< HEAD
  // Fungsi untuk ambil semua data history (gunakan endpoint history tanpa filter)
  async function fetchAllHistory() {
    // Daripada pakai log-aktivitas yang terbatas 5 data,
    // lebih baik buat query ke history dengan rentang luas
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const endpoint = `http://localhost:3000/api/door/history?mulai=${startDate}&sampai=${endDate}`;
=======
  // Fungsi untuk ambil semua data history
  async function fetchAllHistory() {
    const endpoint = "http://localhost:3000/api/door/log-aktivitas";
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda

    try {
      const response = await fetch(endpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      renderHistoryToTable(data);
    } catch (error) {
      console.error("Gagal ambil data history:", error.message);
      showErrorMessage("Gagal memuat data history");
    }
  }

  // Fungsi untuk render data ke tabel history
  function renderHistoryToTable(data) {
    historyTableBody.innerHTML = ""; // Clear isi tabel

    if (data.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-4 text-center text-gray-500">Tidak ada data history ditemukan</td>
        </tr>
      `;
      return;
    }

    data.forEach((history, index) => {
      // Format waktu
      const createdAt = new Date(history.created_at);
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

<<<<<<< HEAD
      // Handle keterangan - cek apakah field ada
      let keterangan = "Akses Pintu";
      if (history.keterangan) {
        keterangan = history.keterangan;
      } else if (history.status) {
        // Jika tidak ada keterangan, gunakan status
        keterangan = `Akses ${history.status}`;
      }

      // Tentukan warna badge berdasarkan status atau keterangan
      const status = (history.status || keterangan).toLowerCase();
      let badgeClass = "bg-gray-100 text-gray-800"; // default

      if (status.includes("berhasil") || status.includes("success")) {
        badgeClass = "bg-green-100 text-green-800";
      } else if (
        status.includes("gagal") ||
        status.includes("failed") ||
        status.includes("ditolak")
      ) {
        badgeClass = "bg-red-100 text-red-800";
      } else if (status.includes("pending") || status.includes("menunggu")) {
        badgeClass = "bg-yellow-100 text-yellow-800";
      } else if (status.includes("akses")) {
        badgeClass = "bg-blue-100 text-blue-800";
=======
      // Ambil keterangan dari database
      const keterangan = history.keterangan || "Akses Tidak Diketahui";

      // Gunakan field `status` untuk badge (lebih akurat)
      const status = history.status?.toLowerCase() || "pending";

      // Tentukan warna badge berdasarkan `status` (enum)
      let badgeClass = "bg-gray-100 text-gray-800"; // default
      if (status === "berhasil" || status === "success") {
        badgeClass = "bg-green-100 text-green-800";
      } else if (status === "gagal" || status === "failed") {
        badgeClass = "bg-red-100 text-red-800";
      } else if (status === "pending") {
        badgeClass = "bg-yellow-100 text-yellow-800";
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
      }

      const row = `
      <tr class="hover:bg-gray-50">
        <td class="p-4 text-center">${index + 1}</td>
        <td class="p-4">${history.kartu_id || "N/A"}</td>
        <td class="p-4">${history.pengguna || "N/A"}</td>
        <td class="p-4">${tanggal}</td>
        <td class="p-4">${jam}</td>
        <td class="p-4">
          <span class="inline-block px-2 py-1 text-xs font-medium ${badgeClass} rounded-full">
            ${keterangan}
          </span>
        </td>
      </tr>
    `;
      historyTableBody.insertAdjacentHTML("beforeend", row);
    });
  }

  // Fungsi untuk menampilkan pesan error
  function showErrorMessage(message) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-4 text-center text-red-500">${message}</td>
      </tr>
    `;
  }

  // Fungsi untuk ambil data berdasarkan filter tanggal
  async function fetchFilteredHistory(startDate, endDate) {
    const endpoint = `http://localhost:3000/api/door/history?mulai=${startDate}&sampai=${endDate}`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      renderHistoryToTable(data);
    } catch (error) {
      console.error("Gagal ambil data history terfilter:", error.message);
      showErrorMessage("Gagal memuat data filter");
    }
  }

<<<<<<< HEAD
  // Event listener untuk form filter
=======
  // Event listener untuk form filter (jika ada)
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    filterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      if (!startDate || !endDate) {
        alert("Silakan pilih tanggal mulai dan tanggal akhir!");
        return;
      }

      if (startDate > endDate) {
        alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir!");
        return;
      }

      await fetchFilteredHistory(startDate, endDate);
    });

    // Event listener untuk reset button
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
<<<<<<< HEAD
        fetchAllHistory(); // Reset ke data default
=======
        fetchAllHistory();
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
      });
    }
  }

  // Event listener untuk logout button
<<<<<<< HEAD
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "./login.html";
    });
  }

  // Load data history saat halaman pertama kali dibuka
=======
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  });

  // Load semua data saat halaman pertama kali dibuka
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
  fetchAllHistory();
});
