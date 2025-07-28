const db = require("../config/db");

<<<<<<< HEAD
// Ambil log aktivitas terbaru (untuk dashboard dan log activity page)
exports.getLogActivity = async (req, res) => {
  const sql = `SELECT * FROM log_aktivitas ORDER BY created_at DESC LIMIT 10`;

  try {
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (err) {
=======
// Ambil semua log aktivitas dengan debug
exports.getLogActivity = async (req, res) => {
  // // Pertama, cek struktur tabel
  // try {
  //   const [columns] = await db.execute("DESCRIBE log_aktivitas");
  //   console.log(
  //     "Struktur tabel log_aktivitas:",
  //     columns.map((col) => col.Field)
  //   );
  // } catch (err) {
  //   console.error("Error cek struktur tabel:", err);
  // }

  // Query dengan SELECT *untuk melihat semua kolom
  const sql = `SELECT * FROM log_aktivitas ORDER BY created_at DESC LIMIT 5`;

  try {
    const [rows] = await db.execute(sql);
    // console.log("Sample data dari database:", JSON.stringify(rows, null, 2));

    // Kirim semua data untuk debugging
    res.status(200).json(rows);
  } catch (err) {
    // console.error("Error mengambil data log:", err);
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
    res.status(500).json({
      message: "Gagal mengambil data log",
      error: err.message,
    });
  }
};

<<<<<<< HEAD
// Ambil history berdasarkan rentang tanggal (untuk halaman history)
exports.getHistory = async (req, res) => {
  const { mulai, sampai } = req.query;

  // Jika tidak ada filter tanggal, ambil data 30 hari terakhir
  let sql, params;

  if (!mulai || !sampai) {
    // Default: 30 hari terakhir
    sql = `SELECT * FROM log_aktivitas 
           WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
           ORDER BY created_at DESC`;
    params = [];
  } else {
    // Dengan filter tanggal
    sql = `SELECT * FROM log_aktivitas 
           WHERE DATE(created_at) BETWEEN ? AND ? 
           ORDER BY created_at DESC`;
    params = [mulai, sampai];
  }

  try {
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error ambil history:", err);
=======
// Ambil history berdasarkan rentang tanggal
exports.getHistory = async (req, res) => {
  const { mulai, sampai } = req.query;

  if (!mulai || !sampai) {
    return res.status(400).json({ error: "Rentang tanggal tidak lengkap" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM log_aktivitas WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC",
      [mulai, sampai]
    );
    // console.log("History data:", JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (err) {
    // console.error("Error ambil history:", err);
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
    res.status(500).json({ error: "Gagal ambil data history" });
  }
};

<<<<<<< HEAD
// Endpoint untuk status dashboard (jika diperlukan)
exports.getDoorStatus = async (req, res) => {
  try {
    // Ambil data log terbaru
    const [latestLog] = await db.execute(
      "SELECT * FROM log_aktivitas ORDER BY created_at DESC LIMIT 1"
    );

    // Hitung total akses hari ini
    const today = new Date().toISOString().split("T")[0];
    const [todayAccess] = await db.execute(
      "SELECT COUNT(*) as total FROM log_aktivitas WHERE DATE(created_at) = ?",
      [today]
    );

    // Response data
    const response = {
      status_pintu: "Tertutup", // Default status
      waktu_akses: latestLog.length > 0 ? latestLog[0].created_at : null,
      total_akses_hari_ini: todayAccess[0].total,
      last_user: latestLog.length > 0 ? latestLog[0].pengguna : null,
      last_card_id: latestLog.length > 0 ? latestLog[0].kartu_id : null,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error mengambil status pintu:", err);
    res.status(500).json({
      message: "Gagal mengambil status pintu",
      error: err.message,
    });
  }
};
=======
// const db = require("../config/db");

// // Ambil semua log aktivitas
// exports.getLogActivity = async (req, res) => {
//   const sql = `SELECT kartu_id, pengguna, created_at, status, keterangan FROM log_aktivitas ORDER BY created_at DESC`;

//   try {
//     const [rows] = await db.execute(sql);
//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error mengambil data log:", err);
//     res.status(500).json({
//       message: "Gagal mengambil data log",
//       error: err.message,
//     });
//   }
// };

// // Ambil history berdasarkan rentang tanggal
// exports.getHistory = async (req, res) => {
//   const { mulai, sampai } = req.query;

//   if (!mulai || !sampai) {
//     return res.status(400).json({ error: "Rentang tanggal tidak lengkap" });
//   }

//   try {
//     const [rows] = await db.execute(
//       "SELECT * FROM log_aktivitas WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC",
//       [mulai, sampai]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error("Error ambil history:", err);
//     res.status(500).json({ error: "Gagal ambil data history" });
//   }
// };
>>>>>>> 0c634be8b03575a29b348b2bcb5baba0bcb89cda
