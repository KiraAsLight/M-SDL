const db = require("../config/db");

// Get all cards with optional filtering
exports.getAllCards = async (req, res) => {
  const { status, search } = req.query;

  let sql = "SELECT * FROM authorized_cards WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND is_active = ?";
    params.push(status === "aktif" ? 1 : 0);
  }

  if (search) {
    sql += " AND (card_id LIKE ? OR user_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY created_at DESC";

  try {
    const [rows] = await db.execute(sql, params);

    // Transform database fields to match frontend expectations
    const cards = rows.map((card) => ({
      id: card.id,
      card_id: card.card_id,
      user_name: card.user_name,
      status: card.is_active ? "aktif" : "nonaktif",
      is_active: card.is_active,
      created_at: card.created_at,
      updated_at: card.updated_at,
    }));

    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({
      message: "Gagal mengambil data kartu",
      error: error.message,
    });
  }
};

// Get card statistics
exports.getCardStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM authorized_cards
    `);

    res.json({
      total: stats[0].total,
      active: stats[0].active,
      inactive: stats[0].inactive,
      suspended: 0, // We'll implement suspend status later
    });
  } catch (error) {
    console.error("Error fetching card stats:", error);
    res.status(500).json({
      message: "Gagal mengambil statistik kartu",
      error: error.message,
    });
  }
};

// Add new card
exports.addCard = async (req, res) => {
  const { card_id, user_name, status } = req.body;

  if (!card_id || !user_name) {
    return res.status(400).json({
      message: "ID kartu dan nama pemilik harus diisi",
    });
  }

  try {
    // Check if card already exists
    const [existing] = await db.execute(
      "SELECT id FROM authorized_cards WHERE card_id = ?",
      [card_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "ID kartu sudah terdaftar",
      });
    }

    // Insert new card
    const isActive = status === "aktif" ? 1 : 0;
    const [result] = await db.execute(
      "INSERT INTO authorized_cards (card_id, user_name, is_active) VALUES (?, ?, ?)",
      [card_id, user_name, isActive]
    );

    res.status(201).json({
      message: "Kartu berhasil ditambahkan",
      card: {
        id: result.insertId,
        card_id,
        user_name,
        status,
        is_active: isActive,
      },
    });
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({
      message: "Gagal menambahkan kartu",
      error: error.message,
    });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const { card_id, user_name, status } = req.body;

  if (!card_id || !user_name) {
    return res.status(400).json({
      message: "ID kartu dan nama pemilik harus diisi",
    });
  }

  try {
    // Check if card exists
    const [existing] = await db.execute(
      "SELECT id FROM authorized_cards WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Kartu tidak ditemukan",
      });
    }

    // Check if new card_id conflicts with other cards
    const [conflict] = await db.execute(
      "SELECT id FROM authorized_cards WHERE card_id = ? AND id != ?",
      [card_id, id]
    );

    if (conflict.length > 0) {
      return res.status(409).json({
        message: "ID kartu sudah digunakan oleh kartu lain",
      });
    }

    // Update card
    const isActive = status === "aktif" ? 1 : 0;
    await db.execute(
      "UPDATE authorized_cards SET card_id = ?, user_name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [card_id, user_name, isActive, id]
    );

    res.json({
      message: "Kartu berhasil diupdate",
      card: {
        id: parseInt(id),
        card_id,
        user_name,
        status,
        is_active: isActive,
      },
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({
      message: "Gagal mengupdate kartu",
      error: error.message,
    });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if card exists
    const [existing] = await db.execute(
      "SELECT card_id FROM authorized_cards WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Kartu tidak ditemukan",
      });
    }

    // Delete card
    await db.execute("DELETE FROM authorized_cards WHERE id = ?", [id]);

    res.json({
      message: "Kartu berhasil dihapus",
      deleted_card_id: existing[0].card_id,
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({
      message: "Gagal menghapus kartu",
      error: error.message,
    });
  }
};

// Toggle card status (activate/deactivate)
exports.toggleCardStatus = async (req, res) => {
  const { id } = req.params;

  try {
    // Get current status
    const [current] = await db.execute(
      "SELECT is_active, card_id FROM authorized_cards WHERE id = ?",
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({
        message: "Kartu tidak ditemukan",
      });
    }

    // Toggle status
    const newStatus = current[0].is_active ? 0 : 1;
    await db.execute(
      "UPDATE authorized_cards SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      message: `Kartu ${current[0].card_id} ${
        newStatus ? "diaktifkan" : "dinonaktifkan"
      }`,
      card_id: current[0].card_id,
      new_status: newStatus ? "aktif" : "nonaktif",
      is_active: newStatus,
    });
  } catch (error) {
    console.error("Error toggling card status:", error);
    res.status(500).json({
      message: "Gagal mengubah status kartu",
      error: error.message,
    });
  }
};

// Get card by ID (for RFID validation)
exports.getCardById = async (req, res) => {
  const { card_id } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM authorized_cards WHERE card_id = ?",
      [card_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Kartu tidak ditemukan",
      });
    }

    const card = {
      id: rows[0].id,
      card_id: rows[0].card_id,
      user_name: rows[0].user_name,
      status: rows[0].is_active ? "aktif" : "nonaktif",
      is_active: rows[0].is_active,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
    };

    res.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({
      message: "Gagal mengambil data kartu",
      error: error.message,
    });
  }
};
