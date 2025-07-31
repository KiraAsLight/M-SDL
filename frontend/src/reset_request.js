document.getElementById("Reset_Request_Form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("http://localhost:3000/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    message.textContent = data.message;
    message.style.color = res.ok ? "lightgreen" : "red";

    if (res.ok) {
      setTimeout(() => {
        window.location.href = "reset_password.html?token=" + data.token;
      }, 2000);
    }
  } catch (err) {
    message.textContent = "Gagal mengirim permintaan.";
    message.style.color = "red";
  }
});