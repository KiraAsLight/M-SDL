document
  .getElementById("Login_Form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    // Reset message
    message.textContent = "";
    message.style.color = "";

    // Basic validation
    if (!email || !password) {
      message.textContent = "Email dan password harus diisi!";
      message.style.color = "red";
      return;
    }

    // Disable button during request
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Simpan token ke localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userEmail", data.user.email);

        message.textContent = "Login berhasil. Mengalihkan...";
        message.style.color = "lightgreen";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        message.textContent = data.message || "Gagal login.";
        message.style.color = "red";
      }
    } catch (err) {
      console.error("Login error:", err);
      message.textContent = "Tidak dapat terhubung ke server.";
      message.style.color = "red";
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
