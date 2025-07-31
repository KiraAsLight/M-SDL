document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const cardsTableBody = document.getElementById("cardsTableBody");
  const addCardBtn = document.getElementById("addCardBtn");
  const cardModal = document.getElementById("cardModal");
  const cardForm = document.getElementById("cardForm");
  const cancelBtn = document.getElementById("cancelBtn");
  const modalTitle = document.getElementById("modalTitle");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const refreshBtn = document.getElementById("refreshBtn");

  // Stats elements
  const totalCardsEl = document.getElementById("totalCards");
  const activeCardsEl = document.getElementById("activeCards");
  const inactiveCardsEl = document.getElementById("inactiveCards");
  const suspendedCardsEl = document.getElementById("suspendedCards");

  // Global variables
  let isEditMode = false;
  let editingCardId = null;
  let allCards = [];

  // Authentication check
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  // API Base URL
  const API_BASE = "http://localhost:3000/api";

  // Initialize
  loadCards();
  loadStats();

  // Event Listeners
  addCardBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", () => closeModal());
  cardForm.addEventListener("submit", handleFormSubmit);
  searchInput.addEventListener("input", filterCards);
  statusFilter.addEventListener("change", filterCards);
  refreshBtn.addEventListener("click", () => {
    loadCards();
    loadStats();
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeUser("userEmail");
    window.location.href = "./login.html";
  });

  // Close modal when clicking outside
  cardModal.addEventListener("click", (e) => {
    if (e.target === cardModal) {
      closeModal();
    }
  });

  // Load all cards
  async function loadCards() {
    try {
      const response = await fetch(`${API_BASE}/cards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cards = await response.json();
      allCards = cards;
      renderCards(cards);
    } catch (error) {
      console.error("Error loading cards:", error);
      showError("Gagal memuat data kartu");
    }
  }

  // Load card statistics
  async function loadStats() {
    try {
      const response = await fetch(`${API_BASE}/cards/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      updateStats(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
      updateStats({ total: 0, active: 0, inactive: 0, suspended: 0 });
    }
  }

  // Update statistics display
  function updateStats(stats) {
    totalCardsEl.textContent = stats.total;
    activeCardsEl.textContent = stats.active;
    inactiveCardsEl.textContent = stats.inactive;
    suspendedCardsEl.textContent = stats.suspended;
  }

  // Render cards table
  function renderCards(cards) {
    cardsTableBody.innerHTML = "";

    if (cards.length === 0) {
      cardsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-4 text-center text-gray-500">Tidak ada kartu ditemukan</td>
        </tr>
      `;
      return;
    }

    cards.forEach((card) => {
      const createdAt = new Date(card.created_at).toLocaleDateString("id-ID");
      const updatedAt = new Date(card.updated_at).toLocaleDateString("id-ID");

      const statusBadge = getStatusBadge(card.status);

      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50";
      row.innerHTML = `
        <td class="p-4 font-mono text-sm">${card.card_id}</td>
        <td class="p-4">${card.user_name}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 text-sm text-gray-600">${createdAt}</td>
        <td class="p-4 text-sm text-gray-600">${updatedAt}</td>
        <td class="p-4 text-center">
          <div class="flex justify-center gap-2">
            <button 
              onclick="editCard(${card.id})"
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              ✏️ Edit
            </button>
            <button 
              onclick="toggleCardStatus(${card.id}, '${card.status}')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              ${card.status === "aktif" ? "❌ Nonaktif" : "✅ Aktif"}
            </button>
            <button 
              onclick="deleteCard(${card.id}, '${card.card_id}')"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              🗑️ Hapus
            </button>
          </div>
        </td>
      `;

      cardsTableBody.appendChild(row);
    });
  }

  // Get status badge HTML
  function getStatusBadge(status) {
    const badgeClasses = {
      aktif: "bg-green-100 text-green-800",
      nonaktif: "bg-red-100 text-red-800",
      suspend: "bg-yellow-100 text-yellow-800",
    };

    const badgeIcons = {
      aktif: "✅",
      nonaktif: "❌",
      suspend: "⏸️",
    };

    return `
      <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
        badgeClasses[status]
      } rounded-full">
        ${badgeIcons[status]} ${status.toUpperCase()}
      </span>
    `;
  }

  // Filter cards based on search and status
  function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;

    let filteredCards = allCards;

    // Filter by search term
    if (searchTerm) {
      filteredCards = filteredCards.filter(
        (card) =>
          card.card_id.toLowerCase().includes(searchTerm) ||
          card.user_name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilterValue) {
      filteredCards = filteredCards.filter(
        (card) => card.status === statusFilterValue
      );
    }

    renderCards(filteredCards);
  }

  // Open modal for add/edit
  function openModal(card = null) {
    isEditMode = !!card;
    editingCardId = card ? card.id : null;

    modalTitle.textContent = isEditMode ? "Edit Kartu" : "Tambah Kartu Baru";

    // Reset form
    cardForm.reset();

    // Fill form if editing
    if (isEditMode) {
      document.getElementById("cardId").value = card.card_id;
      document.getElementById("userName").value = card.user_name;
      document.getElementById("cardStatus").value = card.status;
    }

    cardModal.classList.remove("hidden");
  }

  // Close modal
  function closeModal() {
    cardModal.classList.add("hidden");
    isEditMode = false;
    editingCardId = null;
    cardForm.reset();
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
      card_id: document.getElementById("cardId").value,
      user_name: document.getElementById("userName").value,
      status: document.getElementById("cardStatus").value,
    };

    try {
      const url = isEditMode
        ? `${API_BASE}/cards/${editingCardId}`
        : `${API_BASE}/cards`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan kartu");
      }

      showSuccess(result.message);
      closeModal();
      loadCards();
      loadStats();
    } catch (error) {
      console.error("Error saving card:", error);
      showError(error.message);
    }
  }

  // Edit card function (global scope)
  window.editCard = function (cardId) {
    const card = allCards.find((c) => c.id === cardId);
    if (card) {
      openModal(card);
    }
  };

  // Toggle card status function (global scope)
  window.toggleCardStatus = async function (cardId, currentStatus) {
    const action = currentStatus === "aktif" ? "menonaktifkan" : "mengaktifkan";

    if (!confirm(`Apakah Anda yakin ingin ${action} kartu ini?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/cards/${cardId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status kartu");
      }

      showSuccess(result.message);
      loadCards();
      loadStats();
    } catch (error) {
      console.error("Error toggling card status:", error);
      showError(error.message);
    }
  };

  // Delete card function (global scope)
  window.deleteCard = async function (cardId, cardIdText) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus kartu ${cardIdText}?\n\nTindakan ini tidak dapat dibatalkan!`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus kartu");
      }

      showSuccess(result.message);
      loadCards();
      loadStats();
    } catch (error) {
      console.error("Error deleting card:", error);
      showError(error.message);
    }
  };

  // Show success notification
  function showSuccess(message) {
    showNotification(message, "success");
  }

  // Show error notification
  function showError(message) {
    showNotification(message, "error");
  }

  // Show notification
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
});
