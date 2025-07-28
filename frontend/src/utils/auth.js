// Auth utility functions untuk frontend

// Cek apakah user sudah login
function isLoggedIn() {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    // Decode JWT untuk cek expiry (tanpa verify signature)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

// Redirect ke login jika belum login
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

// Get auth headers untuk API calls
function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// Logout user
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  window.location.href = "./login.html";
}

// Fetch dengan auth headers
async function authFetch(url, options = {}) {
  const defaultOptions = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  // Jika unauthorized, logout otomatis
  if (response.status === 401 || response.status === 403) {
    logout();
    return;
  }

  return response;
}

// Auto-logout jika token expired
function checkTokenExpiry() {
  if (!isLoggedIn() && window.location.pathname !== "/login.html") {
    logout();
  }
}

// Check setiap 5 menit
setInterval(checkTokenExpiry, 5 * 60 * 1000);

// Export functions jika diperlukan
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isLoggedIn,
    requireAuth,
    getAuthHeaders,
    logout,
    authFetch,
    checkTokenExpiry,
  };
}
