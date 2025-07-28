window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("Register_Form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            document.getElementById("message").textContent =
            data.message || "Berhasil daftar!";
        } catch (err) {
            document.getElementById("message").textContent =
            "Gagal menghubungi server.";
        }
    });
});