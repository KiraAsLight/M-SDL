if (document.getElementById("token")) {
  document
    .getElementById("Reset_Password_Form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const token = document.getElementById("token").value.trim();

      // Redirect ke halaman reset-action dengan token di URL
      window.location.href = `reset_action.html?token=${encodeURIComponent(
        token
      )}`;
    });
}

if (document.getElementById("New_Password")) {
  // Ambil token dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("Token tidak ditemukan!");
    window.location.href = "reset_password.html";
  }

  // Saat form password disubmit
  document
    .getElementById("Reset_Password_Form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("New_Password").value;

      try {
        const res = await fetch(
          `http://localhost:3000/api/auth/reset-password/${token}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword }),
          }
        );

        const data = await res.json();
        document.getElementById("message").textContent = data.message;
        document.getElementById("message").style.color = res.ok
          ? "lightgreen"
          : "red";

        if (res.ok) {
          setTimeout(() => {
            window.location.href = "login.html"; // Pindah ke login
          }, 2000);
        }
      } catch (err) {
        document.getElementById("message").textContent =
          "Gagal terhubung ke server.";
        document.getElementById("message").style.color = "red";
      }
    });
}

// document.getElementById("Reset_Password_Form").addEventListener("submit", async (e) => {
//     e.preventDefault();
//     // const token = document.getElementById("token").value;
//     const newPassword = document.getElementById("New_Password").value;
//     const message = document.getElementById("message");

//     // ✅ Ambil token dari URL query string: ?token=abc123
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get("token");

//     if (!token) {
//       message.textContent = "Token tidak ditemukan.";
//       message.style.color = "red";
//       return;
//     }

//     try {
//       // ✅ Kirim ke /reset-password/:token (bukan /reset-password)
//       const res = await fetch(
//         `http://localhost:3000/api/auth/reset-password/${token}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ newPassword }),
//         }
//       );

//       const data = await res.json();

//       message.textContent = data.message;
//       message.style.color = res.ok ? "lightgreen" : "red";

//       if (res.ok) {
//         // Opsional: redirect setelah sukses
//         setTimeout(() => {
//           window.location.href = "/login.html";
//         }, 2000);
//       }
//     } catch (err) {
//       console.error(err);
//       message.textContent = "Gagal terhubung ke server.";
//       message.style.color = "red";
//     }

//     // try {
//     //   const res = await fetch("http://localhost:3000/api/auth/reset-password", {
//     //     method: "POST",
//     //     headers: { "Content-Type": "application/json" },
//     //     body: JSON.stringify({ token, newPassword }),
//     //   });

//     //   if (!res.ok) {
//     //     throw new Error(`Server returned ${res.status}: ${await res.text()}`);
//     //   }

//     //   const data = await res.json();
//     //   message.textContent = data.message;
//     //   message.style.color = res.ok ? "lightgreen" : "red";
//     // } catch (err) {
//     //   message.textContent = "Reset gagal.";
//     //   message.style.color = "red";
//     // }
//   });
