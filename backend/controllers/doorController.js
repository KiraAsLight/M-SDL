const db = require("../config/db");

// Ambil log aktivitas terbaru (untuk dashboard dan log activity page)
exports.getLogActivity = async (req, res) => {
  const sql = `SELECT 
    id_log, 
    kartu_id, 
    pengguna, 
    status, 
    keterangan, 
    device_id, 
    created_at 
  FROM log_aktivitas 
  ORDER BY created_at DESC 
  LIMIT 10`;

  try {
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error mengambil log aktivitas:", err);
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
    sql = `SELECT 
      id_log, 
      kartu_id, 
      pengguna, 
      status, 
      keterangan, 
      device_id, 
      created_at 
    FROM log_aktivitas 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
    ORDER BY created_at DESC`;
    params = [];
  } else {
    // Dengan filter tanggal
    sql = `SELECT 
      id_log, 
      kartu_id, 
      pengguna, 
      status, 
      keterangan, 
      device_id, 
      created_at 
    FROM log_aktivitas 
    WHERE DATE(created_at) BETWEEN ? AND ? 
    ORDER BY created_at DESC`;
    params = [mulai, sampai];
  }

  try {
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error ambil history:", err);
    res.status(500).json({ 
      message: "Gagal ambil data history",
      error: err.message 
    });
  }
};

// Endpoint untuk status dashboard
exports.getDoorStatus = async (req, res) => {
  try {
    // Ambil data log terbaru
    const [latestLog] = await db.execute(
      `SELECT 
        id_log, 
        kartu_id, 
        pengguna, 
        status, 
        keterangan, 
        created_at 
      FROM log_aktivitas 
      ORDER BY created_at DESC 
      LIMIT 1`
    );

    // Hitung total akses hari ini
    const today = new Date().toISOString().split("T")[0];
    const [todayAccess] = await db.execute(
      "SELECT COUNT(*) as total FROM log_aktivitas WHERE DATE(created_at) = ?",
      [today]
    );

    // Ambil status device
    const [deviceStatus] = await db.execute(
      "SELECT * FROM device_status WHERE device_id = ? ORDER BY last_heartbeat DESC LIMIT 1",
      [process.env.DEFAULT_DEVICE_ID || 'MAIN_DOOR']
    );

    // Response data
    const response = {
      status_pintu: "Terkunci", // Status Default
      waktu_akses: latestLog.length > 0 ? latestLog[0].created_at : null,
      total_akses_hari_ini: todayAccess[0].total,
      last_user: latestLog.length > 0 ? latestLog[0].pengguna : null,
      last_card_id: latestLog.length > 0 ? latestLog[0].kartu_id : null,
      device_status: deviceStatus.length > 0 ? deviceStatus[0].status : 'offline',
      last_heartbeat: deviceStatus.length > 0 ? deviceStatus[0].last_heartbeat : null
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

// Endpoint untuk statistik aktivitas
exports.getActivityStats = async (req, res) => {
  try {
    // Statistik 7 hari terakhir
    const [weeklyStats] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed
      FROM log_aktivitas
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Statistik hari ini per jam
    const [hourlyStats] = await db.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as total_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed
      FROM log_aktivitas
      WHERE DATE(created_at) = CURDATE()
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `);

    // Top users hari ini
    const [topUsers] = await db.execute(`
      SELECT 
        pengguna,
        COUNT(*) as access_count,
        MAX(created_at) as last_access
      FROM log_aktivitas
      WHERE DATE(created_at) = CURDATE() AND status = 'berhasil'
      GROUP BY pengguna
      ORDER BY access_count DESC
      LIMIT 5
    `);

    res.json({
      weekly_stats: weeklyStats,
      hourly_stats: hourlyStats,
      top_users: topUsers
    });

  } catch (err) {
    console.error("Error mengambil statistik aktivitas:", err);
    res.status(500).json({
      message: "Gagal mengambil statistik aktivitas",
      error: err.message,
    });
  }
};