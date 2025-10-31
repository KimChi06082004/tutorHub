// import express from "express";
import { pool } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

/* =========================================================
   📩 1️⃣ LẤY DANH SÁCH THÔNG BÁO CỦA NGƯỜI DÙNG HIỆN TẠI
========================================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const [rows] = await pool.query(
      `
      SELECT 
        notification_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
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
   📩 2️⃣ LẤY DANH SÁCH THÔNG BÁO RIÊNG CHO HỌC VIÊN
========================================================= */
router.get("/student", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const [rows] = await pool.query(
      `
      SELECT 
        notification_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get student notifications error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải thông báo học viên.",
    });
  }
});

/* =========================================================
   📩 3️⃣ LẤY DANH SÁCH THÔNG BÁO RIÊNG CHO GIA SƯ
========================================================= */
router.get("/tutor", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const [rows] = await pool.query(
      `
      SELECT 
        notification_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get tutor notifications error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải thông báo gia sư.",
    });
  }
});

/* =========================================================
   📩 4️⃣ ĐÁNH DẤU ĐÃ ĐỌC MỘT THÔNG BÁO
========================================================= */
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const [check] = await pool.query(
      `
      SELECT notification_id FROM notifications
      WHERE notification_id = ? AND user_id = ?
      `,
      [id, user_id]
    );

    if (!check.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo.",
      });
    }

    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE notification_id = ?",
      [id]
    );

    res.json({ success: true, message: "Đã đánh dấu thông báo là đã đọc." });
  } catch (err) {
    console.error("❌ Mark notification as read error:", err);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái thông báo.",
    });
  }
});

export default router;
