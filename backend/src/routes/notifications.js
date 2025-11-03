import express from "express";
import { pool } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

/* =========================================================
   📩 1️⃣ LẤY DANH SÁCH THÔNG BÁO CỦA NGƯỜI DÙNG HIỆN TẠI
========================================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { user_id, role } = req.user;

    const [rows] = await pool.query(
      `
      SELECT 
        notification_id,
        title,
        message,
        type,
        role,
        is_read,
        created_at
      FROM notifications
      WHERE (user_id = ? OR user_id IS NULL)
        AND (role = ? OR role IS NULL)
      ORDER BY created_at DESC
      `,
      [user_id, role]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get notifications error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách thông báo.",
    });
  }
});

/* =========================================================
   📩 2️⃣ ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC
========================================================= */
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const [result] = await pool.query(
      `
      UPDATE notifications 
      SET is_read = 1, updated_at = NOW()
      WHERE notification_id = ? AND user_id = ?
      `,
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo hoặc không thuộc về bạn.",
      });
    }

    res.json({ success: true, message: "✅ Đã đánh dấu thông báo là đã đọc." });
  } catch (err) {
    console.error("❌ Mark notification as read error:", err);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái thông báo.",
    });
  }
});

/* =========================================================
   📩 3️⃣ XOÁ MỘT THÔNG BÁO
========================================================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const [result] = await pool.query(
      "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo hoặc không thuộc về bạn.",
      });
    }

    res.json({ success: true, message: "🗑️ Đã xóa thông báo thành công." });
  } catch (err) {
    console.error("❌ Delete notification error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thông báo.",
    });
  }
});

/* =========================================================
   📩 4️⃣ GỬI THÔNG BÁO
========================================================= */
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { user_id: targetUserId, title, message, type, role } = req.body;
    const { user_id: senderId } = req.user;

    if (!targetUserId || !title || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin thông báo." });
    }

    await pool.query(
      `
      INSERT INTO notifications (user_id, role, title, message, type, is_read, created_at, sender_id)
      VALUES (?, ?, ?, ?, ?, 0, NOW(), ?)
      `,
      [targetUserId, role || "all", title, message, type || "info", senderId]
    );

    res.json({ success: true, message: "📨 Gửi thông báo thành công." });
  } catch (err) {
    console.error("❌ Send notification error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi thông báo.",
    });
  }
});

export default router;
