// src/routes/sessions.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRoles } from "../middlewares/auth.js"; // ✅ đúng tên middleware của bạn

const router = express.Router();

/* =========================================================
   🗓️ GET /api/sessions/:class_id
   - Lấy danh sách buổi học của 1 lớp
========================================================= */
router.get("/:class_id", verifyToken, async (req, res) => {
  try {
    const { class_id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        session_id,
        class_id,
        DATE_FORMAT(session_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(session_date, '%H:%i') AS time,
        status
      FROM sessions
      WHERE class_id=?
      ORDER BY session_date ASC
      `,
      [class_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get sessions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   🆕 POST /api/sessions/:class_id
   - Gia sư tạo lịch dạy cho lớp
========================================================= */
router.post(
  "/:class_id",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const { sessions } = req.body; // [{ date: '2025-06-21', time: '17:00' }, ...]

      if (!Array.isArray(sessions) || sessions.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu danh sách buổi học." });
      }

      const { class_id } = req.params;

      // Xoá lịch cũ (nếu có)
      await pool.query("DELETE FROM sessions WHERE class_id=?", [class_id]);

      // Thêm lịch mới
      for (const s of sessions) {
        const sessionDateTime = `${s.date} ${s.time}:00`; // format chuẩn MySQL DATETIME
        await pool.query(
          "INSERT INTO sessions (class_id, session_date, status) VALUES (?, ?, 'SCHEDULED')",
          [class_id, sessionDateTime]
        );
      }

      res.json({
        success: true,
        message: "✅ Lịch dạy đã được tạo thành công.",
      });
    } catch (err) {
      console.error("❌ Create sessions error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   ✏️ PUT /api/sessions/:id/status
   - Gia sư cập nhật trạng thái buổi học (đã dạy / nghỉ)
========================================================= */
router.put(
  "/:id/status",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["SCHEDULED", "COMPLETED", "CANCELLED"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Trạng thái không hợp lệ." });
      }

      await pool.query("UPDATE sessions SET status=? WHERE session_id=?", [
        status,
        req.params.id,
      ]);

      res.json({
        success: true,
        message: "✅ Đã cập nhật trạng thái buổi học.",
      });
    } catch (err) {
      console.error("❌ Update session status error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   🗑️ DELETE /api/sessions/:id
========================================================= */
router.delete(
  "/:id",
  verifyToken,
  requireRoles(["tutor", "admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM sessions WHERE session_id=?", [
        req.params.id,
      ]);
      res.json({ success: true, message: "🗑️ Buổi học đã bị xoá." });
    } catch (err) {
      console.error("❌ Delete session error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
