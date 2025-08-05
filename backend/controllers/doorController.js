const db = require("../config/db");

// Ambil log aktivitas terbaru (untuk dashboard dan log activity page)
exports.getLogActivity = async (req, res) => {
  const sql = `SELECT 
    id_log, 
    card_id, 
    user_name, 
    status, 
    description, 
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
      card_id, 
      user_name, 
      status, 
      description, 
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
      card_id, 
      user_name, 
      status, 
      description, 
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
      error: err.message,
    });
  }
};

// Enhanced endpoint untuk status dashboard dengan real-time data
exports.getDoorStatus = async (req, res) => {
  try {
    // Ambil data log terbaru
    const [latestLog] = await db.execute(
      `SELECT 
        id_log, 
        card_id, 
        user_name, 
        status, 
        description, 
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

    // Hitung statistik akses hari ini
    const [todayStats] = await db.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM log_aktivitas 
      WHERE DATE(created_at) = ?`,
      [today]
    );

    // Ambil status device terbaru
    const [deviceStatus] = await db.execute(
      `SELECT 
        device_id,
        status,
        sensors_data,
        last_heartbeat,
        TIMESTAMPDIFF(SECOND, last_heartbeat, NOW()) as seconds_since_heartbeat
      FROM device_status 
      WHERE device_id = ? 
      ORDER BY last_heartbeat DESC 
      LIMIT 1`,
      [process.env.DEFAULT_DEVICE_ID || "MAIN_DOOR"]
    );

    // Tentukan status device berdasarkan heartbeat
    let deviceInfo = {
      device_id: process.env.DEFAULT_DEVICE_ID || "MAIN_DOOR",
      status: "offline",
      is_online: false,
      last_heartbeat: null,
      seconds_since_heartbeat: null,
      sensors: null,
    };

    if (deviceStatus.length > 0) {
      const device = deviceStatus[0];
      const isOnline = device.seconds_since_heartbeat < 120; // 2 minutes timeout

      deviceInfo = {
        device_id: device.device_id,
        status: isOnline ? device.status : "offline",
        is_online: isOnline,
        last_heartbeat: device.last_heartbeat,
        seconds_since_heartbeat: device.seconds_since_heartbeat,
        sensors: device.sensors_data ? JSON.parse(device.sensors_data) : null,
      };
    }

    // Tentukan status pintu berdasarkan device status dan log terbaru
    let doorStatus = "Unknown";
    let doorIcon = "❓";

    if (deviceInfo.is_online) {
      doorStatus = "Terkunci"; // Default untuk device online
      doorIcon = "🔒";
    } else {
      doorStatus = "Offline";
      doorIcon = "📵";
    }

    // Response data dengan field names yang sudah diupdate
    const response = {
      // Status pintu
      door_status: doorStatus,
      door_icon: doorIcon,

      // Device info
      device: deviceInfo,

      // Latest access info - UPDATED FIELD NAMES
      latest_access: {
        timestamp: latestLog.length > 0 ? latestLog[0].created_at : null,
        user: latestLog.length > 0 ? latestLog[0].user_name : null,
        card_id: latestLog.length > 0 ? latestLog[0].card_id : null,
        status: latestLog.length > 0 ? latestLog[0].status : null,
        description: latestLog.length > 0 ? latestLog[0].description : null,
      },

      // Today's statistics
      today_stats: {
        total_access: todayAccess[0].total,
        successful: todayStats[0].successful || 0,
        failed: todayStats[0].failed || 0,
        pending: todayStats[0].pending || 0,
      },

      // Metadata
      timestamp: new Date().toISOString(),
      timezone: "Asia/Jakarta",
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

// Endpoint untuk statistik aktivitas (enhanced)
exports.getActivityStats = async (req, res) => {
  try {
    // Statistik 7 hari terakhir - UPDATED FIELD NAMES
    const [weeklyStats] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM log_aktivitas
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Statistik hari ini per jam - UPDATED FIELD NAMES
    const [hourlyStats] = await db.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as total_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM log_aktivitas
      WHERE DATE(created_at) = CURDATE()
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `);

    // Top users hari ini - UPDATED FIELD NAMES
    const [topUsers] = await db.execute(`
      SELECT 
        user_name,
        COUNT(*) as access_count,
        MAX(created_at) as last_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful_count,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed_count
      FROM log_aktivitas
      WHERE DATE(created_at) = CURDATE()
      GROUP BY user_name
      ORDER BY access_count DESC
      LIMIT 5
    `);

    // Statistik bulanan - UPDATED FIELD NAMES
    const [monthlyStats] = await db.execute(`
      SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as total_access,
        SUM(CASE WHEN status = 'berhasil' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'gagal' THEN 1 ELSE 0 END) as failed,
        COUNT(DISTINCT user_name) as unique_users
      FROM log_aktivitas
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year DESC, month DESC
    `);

    // Status kartu aktif
    const [cardStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_cards,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_cards,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_cards
      FROM authorized_cards
    `);

    res.json({
      weekly_stats: weeklyStats,
      hourly_stats: hourlyStats,
      top_users: topUsers,
      monthly_stats: monthlyStats,
      card_stats: cardStats[0],
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error mengambil statistik aktivitas:", err);
    res.status(500).json({
      message: "Gagal mengambil statistik aktivitas",
      error: err.message,
    });
  }
};

// Endpoint untuk real-time dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Query gabungan untuk efisiensi - UPDATED FIELD NAMES
    const [summary] = await db.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM log_aktivitas WHERE DATE(created_at) = ?) as today_total,
        (SELECT COUNT(*) FROM log_aktivitas WHERE DATE(created_at) = ? AND status = 'berhasil') as today_successful,
        (SELECT COUNT(*) FROM log_aktivitas WHERE DATE(created_at) = ? AND status = 'gagal') as today_failed,
        (SELECT COUNT(*) FROM log_aktivitas WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as week_total,
        (SELECT COUNT(DISTINCT user_name) FROM log_aktivitas WHERE DATE(created_at) = ?) as today_unique_users,
        (SELECT COUNT(*) FROM authorized_cards WHERE is_active = 1) as active_cards
    `,
      [today, today, today, today]
    );

    // Latest activity - UPDATED FIELD NAMES
    const [latestActivity] = await db.execute(
      `SELECT 
        id_log, card_id, user_name, status, description, created_at
      FROM log_aktivitas 
      ORDER BY created_at DESC 
      LIMIT 5`
    );

    // Device status
    const [deviceStatus] = await db.execute(
      `SELECT 
        device_id, status, last_heartbeat,
        TIMESTAMPDIFF(SECOND, last_heartbeat, NOW()) as seconds_since_heartbeat
      FROM device_status 
      WHERE device_id = ?
      ORDER BY last_heartbeat DESC 
      LIMIT 1`,
      [process.env.DEFAULT_DEVICE_ID || "MAIN_DOOR"]
    );

    const isDeviceOnline =
      deviceStatus.length > 0 && deviceStatus[0].seconds_since_heartbeat < 120;

    res.json({
      summary: summary[0],
      latest_activity: latestActivity,
      device_online: isDeviceOnline,
      device_status: deviceStatus[0] || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error mengambil dashboard summary:", err);
    res.status(500).json({
      message: "Gagal mengambil dashboard summary",
      error: err.message,
    });
  }
};

exports.deleteLog = async (req, res) => {
  const { id_log } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM log_aktivitas WHERE id_log = ?",
      [id_log]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Log aktivitas tidak ditemukan" });
    }

    res.json({ message: "Log aktivitas berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus data log", err);
    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus data log.",
      error: err.message,
    });
  }
};
