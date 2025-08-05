document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const historyTableBody = document.getElementById("historyTableBody");
  const resultsInfo = document.getElementById("resultsInfo");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const applyFilters = document.getElementById("applyFilters");
  const generateReport = document.getElementById("generateReport");

  // Filter elements
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const userFilter = document.getElementById("userFilter");
  const cardFilter = document.getElementById("cardFilter");
  const statusFilter = document.getElementById("statusFilter");

  // Quick filter buttons
  const todayFilter = document.getElementById("todayFilter");
  const weekFilter = document.getElementById("weekFilter");
  const monthFilter = document.getElementById("monthFilter");
  const lastMonthFilter = document.getElementById("lastMonthFilter");
  const clearFilters = document.getElementById("clearFilters");

  // Pagination elements
  const recordsPerPage = document.getElementById("recordsPerPage");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  const pageNumbers = document.getElementById("pageNumbers");

  // Statistics elements
  const totalRecords = document.getElementById("totalRecords");
  const successfulAccess = document.getElementById("successfulAccess");
  const failedAttempts = document.getElementById("failedAttempts");
  const uniqueUsers = document.getElementById("uniqueUsers");

  // Modal elements
  const detailModal = document.getElementById("detailModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");

  // Global variables
  let allData = [];
  let filteredData = [];
  let currentPage = 1;
  let sortField = "created_at";
  let sortDirection = "desc";
  const API_BASE = "http://localhost:3000/api";

  // Authentication check
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  // Initialize
  loadHistoryData();
  setupEventListeners();

  // Event Listeners
  function setupEventListeners() {
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      window.location.href = "./login.html";
    });

    // Filter buttons
    applyFilters.addEventListener("click", applyCurrentFilters);
    refreshBtn.addEventListener("click", loadHistoryData);
    exportPdfBtn.addEventListener("click", exportToPDF);
    generateReport.addEventListener("click", generateMonthlyReport);

    // Quick date filters
    todayFilter.addEventListener("click", () => setQuickDateFilter("today"));
    weekFilter.addEventListener("click", () => setQuickDateFilter("week"));
    monthFilter.addEventListener("click", () => setQuickDateFilter("month"));
    lastMonthFilter.addEventListener("click", () =>
      setQuickDateFilter("lastMonth")
    );
    clearFilters.addEventListener("click", clearAllFilters);

    // Search on type (debounced)
    let searchTimeout;
    [userFilter, cardFilter].forEach((input) => {
      input.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyCurrentFilters, 300);
      });
    });

    // Status filter
    statusFilter.addEventListener("change", applyCurrentFilters);

    // Records per page
    recordsPerPage.addEventListener("change", () => {
      currentPage = 1;
      renderTable();
    });

    // Pagination
    prevPage.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    nextPage.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredData.length / getRecordsPerPage());
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    // Table sorting - UPDATED FOR ENGLISH FIELDS
    document.querySelectorAll("[data-sort]").forEach((header) => {
      header.addEventListener("click", () => {
        const field = header.getAttribute("data-sort");
        if (sortField === field) {
          sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
          sortField = field;
          sortDirection = "desc";
        }
        sortData();
        renderTable();
        updateSortIndicators();
      });
    });

    // Select all checkbox
    document.getElementById("selectAll").addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(
        'tbody input[type="checkbox"]'
      );
      checkboxes.forEach((cb) => (cb.checked = e.target.checked));
    });

    // Modal
    closeModal.addEventListener("click", () => {
      detailModal.classList.add("hidden");
    });

    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) {
        detailModal.classList.add("hidden");
      }
    });
  }

  // Load data from API
  async function loadHistoryData() {
    try {
      resultsInfo.textContent = "Loading data...";

      const response = await fetch(`${API_BASE}/door/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      allData = await response.json();
      filteredData = [...allData];

      updateStatistics();
      sortData();
      renderTable();
    } catch (error) {
      console.error("Error loading history data:", error);
      showError("Failed to load history data");
      resultsInfo.textContent = "Error loading data";
    }
  }

  // Apply current filters - UPDATED FOR ENGLISH FIELDS
  function applyCurrentFilters() {
    filteredData = allData.filter((record) => {
      // Date filter
      if (startDate.value) {
        const recordDate = new Date(record.created_at)
          .toISOString()
          .split("T")[0];
        if (recordDate < startDate.value) return false;
      }

      if (endDate.value) {
        const recordDate = new Date(record.created_at)
          .toISOString()
          .split("T")[0];
        if (recordDate > endDate.value) return false;
      }

      // User filter - UPDATED FIELD NAME
      if (userFilter.value.trim()) {
        const searchTerm = userFilter.value.toLowerCase().trim();
        if (!record.user_name.toLowerCase().includes(searchTerm)) return false;
      }

      // Card filter - UPDATED FIELD NAME
      if (cardFilter.value.trim()) {
        const searchTerm = cardFilter.value.toLowerCase().trim();
        if (!record.card_id.toLowerCase().includes(searchTerm)) return false;
      }

      // Status filter
      if (statusFilter.value) {
        if (record.status !== statusFilter.value) return false;
      }

      return true;
    });

    currentPage = 1;
    updateStatistics();
    renderTable();
  }

  // Quick date filters
  function setQuickDateFilter(period) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    switch (period) {
      case "today":
        startDate.value = formatDate(startOfDay);
        endDate.value = formatDate(today);
        break;
      case "week":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        startDate.value = formatDate(startOfWeek);
        endDate.value = formatDate(today);
        break;
      case "month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.value = formatDate(startOfMonth);
        endDate.value = formatDate(today);
        break;
      case "lastMonth":
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        startDate.value = formatDate(startOfLastMonth);
        endDate.value = formatDate(endOfLastMonth);
        break;
    }

    applyCurrentFilters();
  }

  // Clear all filters
  function clearAllFilters() {
    startDate.value = "";
    endDate.value = "";
    userFilter.value = "";
    cardFilter.value = "";
    statusFilter.value = "";

    filteredData = [...allData];
    currentPage = 1;
    updateStatistics();
    renderTable();
  }

  // Sort data
  function sortData() {
    filteredData.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle date sorting
      if (sortField === "created_at") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle string sorting
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Update sort indicators
  function updateSortIndicators() {
    document.querySelectorAll(".sort-indicator").forEach((indicator) => {
      indicator.textContent = "↕️";
    });

    const currentHeader = document.querySelector(
      `[data-sort="${sortField}"] .sort-indicator`
    );
    if (currentHeader) {
      currentHeader.textContent = sortDirection === "asc" ? "↑" : "↓";
    }
  }

  // Get records per page setting
  function getRecordsPerPage() {
    const value = recordsPerPage.value;
    return value === "all" ? filteredData.length : parseInt(value);
  }

  // Render table
  function renderTable() {
    const recordsCount = getRecordsPerPage();
    const startIndex = (currentPage - 1) * recordsCount;
    const endIndex =
      recordsCount === filteredData.length
        ? filteredData.length
        : startIndex + recordsCount;
    const currentData = filteredData.slice(startIndex, endIndex);

    historyTableBody.innerHTML = "";

    if (currentData.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-gray-500">
            <div class="text-4xl mb-2">📭</div>
            <div class="text-lg font-medium mb-1">No records found</div>
            <div class="text-sm">Try adjusting your filters or date range</div>
          </td>
        </tr>
      `;
      updateResultsInfo(0, 0, 0);
      return;
    }

    currentData.forEach((record, index) => {
      const row = createTableRow(record, startIndex + index + 1);
      historyTableBody.appendChild(row);
    });

    updateResultsInfo(startIndex + 1, endIndex, filteredData.length);
    updatePagination();
  }

  // Create table row - UPDATED FOR ENGLISH FIELDS
  function createTableRow(record, rowNumber) {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50";

    const createdAt = new Date(record.created_at);
    const dateStr = createdAt.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = createdAt.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const statusBadge = getStatusBadge(record.status);
    const description = record.description || "Door access"; // UPDATED FIELD NAME

    row.innerHTML = `
      <td class="p-4">
        <input type="checkbox" class="rounded" data-id="${record.id_log}">
      </td>
      <td class="p-4 text-center">${rowNumber}</td>
      <td class="p-4">
        <div class="font-medium">${dateStr}</div>
        <div class="text-sm text-gray-500">${timeStr}</div>
      </td>
      <td class="p-4">
        <div class="font-medium">${record.user_name}</div>
      </td>
      <td class="p-4">
        <div class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">${record.card_id}</div>
      </td>
      <td class="p-4">${statusBadge}</td>
      <td class="p-4">
        <div class="text-sm text-gray-600 max-w-xs truncate" title="${description}">
          ${description}
        </div>
      </td>
      <td class="p-4">
        <button 
          onclick="showDetails('${record.id_log}')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
        >
          👁️ Details
        </button>
        <button 
          onclick="deleteRecord('${record.id_log}')"
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
        >
          🗑️ Delete
        </button>
      </td>
    `;

    return row;
  }

  // Get status badge
  function getStatusBadge(status) {
    const badges = {
      berhasil:
        '<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">✅ Success</span>',
      gagal:
        '<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">❌ Failed</span>',
      pending:
        '<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending</span>',
    };

    return (
      badges[status] ||
      '<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">❓ Unknown</span>'
    );
  }

  // Show record details - UPDATED FOR ENGLISH FIELDS
  window.showDetails = function (logId) {
    const record = allData.find((r) => r.id_log == logId);
    if (!record) return;

    const createdAt = new Date(record.created_at);
    const formattedDate = createdAt.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    modalContent.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Log ID:</span>
          <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">${
            record.id_log
          }</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Date & Time:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">User:</span>
          <span class="font-semibold">${record.user_name}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Card ID:</span>
          <span class="font-mono text-sm bg-blue-100 px-2 py-1 rounded">${
            record.card_id
          }</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Status:</span>
          <span>${getStatusBadge(record.status)}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Description:</span>
          <span class="text-right max-w-xs">${
            record.description || "Door access"
          }</span>
        </div>
        ${
          record.device_id
            ? `
        <div class="flex justify-between">
          <span class="font-medium text-gray-700">Device ID:</span>
          <span class="font-mono text-sm">${record.device_id}</span>
        </div>
        `
            : ""
        }
      </div>
    `;

    detailModal.classList.remove("hidden");
  };

  window.deleteRecord = async function (logId) {
    const confirmed = confirm("Yakin mau hapus data ini?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/door/history/${logId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus data.");
      }

      showSuccess("Data berhasil dihapus.");
      // Refresh data
      loadHistoryData();
    } catch (err) {
      console.error(err);
      showError("Terjadi kesalahan saat menghapus data.");
    }
  };

  // Update results info
  function updateResultsInfo(from, to, total) {
    resultsInfo.textContent = `Showing ${from}-${to} of ${total} records`;

    document.getElementById("showingFrom").textContent = from;
    document.getElementById("showingTo").textContent = to;
    document.getElementById("totalEntries").textContent = total;
  }

  // Update pagination
  function updatePagination() {
    const recordsCount = getRecordsPerPage();
    const totalPages = Math.ceil(filteredData.length / recordsCount);

    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbers.innerHTML = "";

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.appendChild(createPageButton(i));
      }
    } else {
      // Show smart pagination
      pageNumbers.appendChild(createPageButton(1));

      if (currentPage > 3) {
        pageNumbers.appendChild(createEllipsis());
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.appendChild(createPageButton(i));
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.appendChild(createEllipsis());
      }

      if (totalPages > 1) {
        pageNumbers.appendChild(createPageButton(totalPages));
      }
    }
  }

  // Create page button
  function createPageButton(pageNum) {
    const button = document.createElement("button");
    button.textContent = pageNum;
    button.className = `px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 ${
      pageNum === currentPage ? "bg-blue-600 text-white border-blue-600" : ""
    }`;

    button.addEventListener("click", () => {
      currentPage = pageNum;
      renderTable();
    });

    return button;
  }

  // Create ellipsis
  function createEllipsis() {
    const span = document.createElement("span");
    span.textContent = "...";
    span.className = "px-3 py-1 text-gray-500";
    return span;
  }

  // Update statistics - UPDATED FOR ENGLISH FIELDS
  function updateStatistics() {
    const total = filteredData.length;
    const successful = filteredData.filter(
      (r) => r.status === "berhasil"
    ).length;
    const failed = filteredData.filter((r) => r.status === "gagal").length;
    const users = new Set(filteredData.map((r) => r.user_name)).size; // UPDATED FIELD NAME

    totalRecords.textContent = total;
    successfulAccess.textContent = successful;
    failedAttempts.textContent = failed;
    uniqueUsers.textContent = users;
  }

  // Export to PDF - UPDATED FOR ENGLISH FIELDS
  async function exportToPDF() {
    const loadingSpinner = exportPdfBtn.querySelector(".loading");
    const originalText = exportPdfBtn.textContent;

    try {
      loadingSpinner.classList.add("active");
      exportPdfBtn.disabled = true;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Smart Door Lock - Access History Report", 14, 22);

      // Add generation info
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const now = new Date();
      doc.text(`Generated: ${now.toLocaleString("id-ID")}`, 14, 32);
      doc.text(`Total Records: ${filteredData.length}`, 14, 38);

      // Add filters info if any
      let yPos = 44;
      if (startDate.value || endDate.value) {
        doc.text(
          `Date Range: ${startDate.value || "All"} to ${
            endDate.value || "All"
          }`,
          14,
          yPos
        );
        yPos += 6;
      }
      if (userFilter.value) {
        doc.text(`User Filter: ${userFilter.value}`, 14, yPos);
        yPos += 6;
      }
      if (statusFilter.value) {
        doc.text(`Status Filter: ${statusFilter.value}`, 14, yPos);
        yPos += 6;
      }

      // Prepare table data - UPDATED FOR ENGLISH FIELDS
      const tableData = filteredData.map((record) => [
        new Date(record.created_at).toLocaleString("id-ID"),
        record.user_name, // UPDATED FIELD NAME
        record.card_id, // UPDATED FIELD NAME
        record.status.toUpperCase(),
        record.description || "Door access", // UPDATED FIELD NAME
      ]);

      // Add table
      doc.autoTable({
        head: [["Date & Time", "User", "Card ID", "Status", "Description"]],
        body: tableData,
        startY: yPos + 10,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
        },
      });

      // Save the PDF
      const filename = `door-lock-history-${formatDate(new Date())}.pdf`;
      doc.save(filename);

      showSuccess("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showError("Failed to export PDF");
    } finally {
      loadingSpinner.classList.remove("active");
      exportPdfBtn.disabled = false;
    }
  }

  // Generate monthly report - UPDATED FOR ENGLISH FIELDS
  async function generateMonthlyReport() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Get current month data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyData = allData.filter((record) => {
        const recordDate = new Date(record.created_at);
        return recordDate >= startOfMonth && recordDate <= endOfMonth;
      });

      // Report header
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("Monthly Access Report", 14, 22);

      doc.setFontSize(14);
      doc.text(
        `${startOfMonth.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        })}`,
        14,
        32
      );

      // Statistics
      const monthlyStats = {
        total: monthlyData.length,
        successful: monthlyData.filter((r) => r.status === "berhasil").length,
        failed: monthlyData.filter((r) => r.status === "gagal").length,
        uniqueUsers: new Set(monthlyData.map((r) => r.user_name)).size, // UPDATED FIELD NAME
      };

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      let yPos = 45;

      doc.text(`Total Access Attempts: ${monthlyStats.total}`, 14, yPos);
      doc.text(
        `Successful Access: ${monthlyStats.successful} (${(
          (monthlyStats.successful / monthlyStats.total) *
          100
        ).toFixed(1)}%)`,
        14,
        yPos + 8
      );
      doc.text(
        `Failed Attempts: ${monthlyStats.failed} (${(
          (monthlyStats.failed / monthlyStats.total) *
          100
        ).toFixed(1)}%)`,
        14,
        yPos + 16
      );
      doc.text(`Unique Users: ${monthlyStats.uniqueUsers}`, 14, yPos + 24);

      // Daily breakdown
      yPos += 40;
      doc.setFont(undefined, "bold");
      doc.text("Daily Breakdown:", 14, yPos);

      const dailyStats = {};
      monthlyData.forEach((record) => {
        const day = new Date(record.created_at).toISOString().split("T")[0];
        if (!dailyStats[day]) {
          dailyStats[day] = { total: 0, successful: 0, failed: 0 };
        }
        dailyStats[day].total++;
        if (record.status === "berhasil") dailyStats[day].successful++;
        if (record.status === "gagal") dailyStats[day].failed++;
      });

      const dailyData = Object.entries(dailyStats).map(([date, stats]) => [
        new Date(date).toLocaleDateString("id-ID"),
        stats.total.toString(),
        stats.successful.toString(),
        stats.failed.toString(),
      ]);

      doc.autoTable({
        head: [["Date", "Total", "Successful", "Failed"]],
        body: dailyData,
        startY: yPos + 10,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Top users - UPDATED FOR ENGLISH FIELDS
      const userStats = {};
      monthlyData.forEach((record) => {
        if (!userStats[record.user_name]) {
          // UPDATED FIELD NAME
          userStats[record.user_name] = 0;
        }
        userStats[record.user_name]++;
      });

      const topUsers = Object.entries(userStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([user, count]) => [user, count.toString()]);

      if (topUsers.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Top Users This Month", 14, 22);

        doc.autoTable({
          head: [["User", "Access Count"]],
          body: topUsers,
          startY: 35,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      const filename = `monthly-report-${startOfMonth.getFullYear()}-${(
        startOfMonth.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}.pdf`;
      doc.save(filename);

      showSuccess("Monthly report generated successfully!");
    } catch (error) {
      console.error("Error generating monthly report:", error);
      showError("Failed to generate monthly report");
    }
  }

  // Utility functions
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function showSuccess(message) {
    showNotification(message, "success");
  }

  function showError(message) {
    showNotification(message, "error");
  }

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
});
