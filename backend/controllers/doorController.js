const db = require("../config/db");

// Ambil log aktivitas terbaru (untuk dashboard dan log activity page)
exports.getLogActivity = async (req, res) => {
  const sql = `SELECT * FROM log_aktivitas ORDER BY created_at DESC LIMIT 10`;

  try {
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data log",
      error: err.message,
    });
  }
};

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
    res.status(500).json({ error: "Gagal ambil data history" });
  }
};

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
      status_pintu: "Terkunci", // Status Default
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
