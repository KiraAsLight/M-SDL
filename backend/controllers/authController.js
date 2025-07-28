const bcrypt = require("bcrypt");
const crypto = require("crypto");
<<<<<<< HEAD
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { sendResetEmail } = require("../utils/mailer");

// Untuk Login User / Admin dengan JWT
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM pengguna WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: "Wrong password." });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: rows[0].id,
        email: rows[0].email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful.",
      token: token,
      user: {
        id: rows[0].id,
        email: rows[0].email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
=======
const db = require("../config/db");
const { sendResetEmail } = require("../utils/mailer");

// Untuk Registrasi User / Admin
// exports.register = async (req, res) => {
//   const { email, password } = req.body;

//   const hashed = await bcrypt.hash(password, 10);
//   try {
//     await db.query(
//       "INSERT INTO pengguna (email, password_hash) VALUES (?, ?)",
//       [email, hashed]
//     );
//     res.json({ message: "Registration successful." });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Registration failed.", error: err.message });
//   }
// };

// Untuk Login User / Admin
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM pengguna WHERE email = ?", [
    email,
  ]);

  if (rows.length === 0)
    return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(password, rows[0].password_hash);
  if (!match) return res.status(401).json({ message: "Wrong password." });

  res.json({ message: "Login successful." });
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
};

// Untuk Request Reset Password
exports.requestReset = async (req, res) => {
  const { email } = req.body;
<<<<<<< HEAD

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    const [rows] = await db.query("SELECT * FROM pengguna WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });

    await db.query(
      "UPDATE pengguna SET reset_token = ?, reset_expiry = ? WHERE email = ?",
      [token, expiry, email]
    );

    await sendResetEmail(email, token);
    res.json({ message: "Reset email sent." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Reset request failed.", error: err.message });
  }
=======
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  const [rows] = await db.query("SELECT * FROM pengguna WHERE email = ?", [
    email,
  ]);
  if (rows.length === 0)
    return res.status(404).json({ message: "User not found." });

  await db.query(
    "UPDATE pengguna SET reset_token = ?, reset_expiry = ? WHERE email = ?",
    [token, expiry, email]
  );
  await sendResetEmail(email, token);
  res.json({ message: "Reset email sent." });
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
};

// Untuk Validasi Token
exports.validateToken = async (req, res) => {
  const { token } = req.params;
<<<<<<< HEAD

  try {
    const [rows] = await db.query(
      "SELECT * FROM pengguna WHERE reset_token = ? AND reset_expiry > NOW()",
      [token]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Invalid or expired token." });
    res.json({ message: "Valid token." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Token validation failed.", error: err.message });
  }
=======
  const [rows] = await db.query(
    "SELECT * FROM pengguna WHERE reset_token = ? AND reset_expiry > NOW()",
    [token]
  );

  if (rows.length === 0)
    return res.status(404).json({ message: "Invalid token." });
  res.json({ message: "Valid token." });
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
};

// Untuk Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

<<<<<<< HEAD
  try {
    const [rows] = await db.query(
      "SELECT * FROM pengguna WHERE reset_token = ? AND reset_expiry > NOW()",
      [token]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Invalid or expired token." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE pengguna SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?",
      [hashed, token]
    );
    res.json({ message: "Password reset successful." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed.", error: err.message });
  }
};
=======
  const [rows] = await db.query(
    "SELECT * FROM pengguna WHERE reset_token = ? AND reset_expiry > NOW()",
    [token]
  );
  if (rows.length === 0)
    return res.status(404).json({ message: "Invalid token." });

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query(
    "UPDATE pengguna SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?",
    [hashed, token]
  );
  res.json({ message: "Password reset successful." });
};
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
