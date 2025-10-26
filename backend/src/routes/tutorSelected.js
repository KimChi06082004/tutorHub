import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* ============================================================
   🧩 Lấy danh sách lớp mà học viên đã gửi lời mời tới gia sư
============================================================ */
router.get("/", verifyToken, requireRole(["tutor"]), async (req, res) => {
  try {
    // ✅ Lấy tutor_id thật từ bảng tutors
    const [tutorRows] = await pool.query(
      "SELECT tutor_id FROM tutors WHERE user_id = ?",
      [req.user.user_id]
    );
    if (!tutorRows.length)
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy hồ sơ gia sư.",
      });

    const tutor_id = tutorRows[0].tutor_id;

    // ✅ Lấy danh sách requests học viên gửi đến gia sư
    const [rows] = await pool.query(
      `
      SELECT 
        r.request_id,
        r.class_id,
        r.message,
        r.status,
        c.subject AS class_subject,
        c.tuition_amount,
        c.schedule,
        c.city,
        c.description,
        c.lat,
        c.lng,
        u.full_name AS student_name
      FROM requests r
      JOIN classes c ON r.class_id = c.class_id
      JOIN users u ON c.student_id = u.user_id
      WHERE r.tutor_id = ? AND r.status = 'PENDING'
      ORDER BY r.created_at DESC
      `,
      [tutor_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách lớp được chọn dạy:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================================
   ✅ Gia sư chấp nhận lời mời học
============================================================ */
router.post(
  "/:request_id/accept",
  verifyToken,
  requireRole(["tutor"]),
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { request_id } = req.params;
      const user_id = req.user.user_id;

      // 🔹 Lấy tutor_id thực tế từ bảng tutors
      const [tutorRows] = await conn.query(
        "SELECT tutor_id FROM tutors WHERE user_id = ?",
        [user_id]
      );
      if (!tutorRows.length) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy hồ sơ gia sư tương ứng.",
        });
      }
      const tutor_id = tutorRows[0].tutor_id;

      // 🔹 Lấy class_id từ request
      const [reqRows] = await conn.query(
        "SELECT class_id FROM requests WHERE request_id = ?",
        [request_id]
      );
      if (!reqRows.length) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy yêu cầu này." });
      }
      const class_id = reqRows[0].class_id;

      // 🔹 Bắt đầu transaction để đảm bảo tính toàn vẹn
      await conn.beginTransaction();

      // 1️⃣ Cập nhật trạng thái request
      await conn.query(
        "UPDATE requests SET status = 'APPROVED' WHERE request_id = ?",
        [request_id]
      );

      // 2️⃣ Gắn tutor vào lớp
      await conn.query(
        `
        UPDATE classes 
        SET tutor_id = ?, status = 'ASSIGNED'
        WHERE class_id = ?
      `,
        [tutor_id, class_id]
      );

      // 3️⃣ Gửi thông báo cho học viên
      await conn.query(
        `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          (SELECT student_id FROM classes WHERE class_id = ?),
          'Gia sư đã chấp nhận dạy',
          'Gia sư đã đồng ý nhận lớp của bạn.',
          'TUTOR_APPROVAL'
        )
      `,
        [class_id]
      );

      await conn.commit();
      res.json({ success: true, message: "✅ Đã chấp nhận dạy lớp này!" });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Lỗi chấp nhận lớp:", err.sqlMessage || err.message);
      res
        .status(500)
        .json({ success: false, message: err.sqlMessage || err.message });
    } finally {
      conn.release();
    }
  }
);

/* ============================================================
   ❌ Gia sư từ chối lời mời
============================================================ */
router.post(
  "/:request_id/reject",
  verifyToken,
  requireRole(["tutor"]),
  async (req, res) => {
    try {
      const { request_id } = req.params;
      const [result] = await pool.query(
        "UPDATE requests SET status = 'REJECTED' WHERE request_id = ?",
        [request_id]
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy yêu cầu." });

      res.json({ success: true, message: "❌ Đã từ chối lời mời!" });
    } catch (err) {
      console.error("❌ Lỗi từ chối lớp:", err.sqlMessage || err.message);
      res
        .status(500)
        .json({ success: false, message: err.sqlMessage || err.message });
    }
  }
);

/* ============================================================
   📘 Xem chi tiết lớp (student → tutor)
============================================================ */
router.get(
  "/:class_id/detail",
  verifyToken,
  requireRole(["tutor"]),
  async (req, res) => {
    try {
      const { class_id } = req.params;

      const [rows] = await pool.query(
        `
      SELECT 
        c.class_id,
        c.subject,
        c.grade,
        c.tuition_amount,
        c.schedule,
        c.city,
        c.ward,
        c.lat,
        c.lng,
        c.description,
        c.requirements,
        c.status,
        u.full_name AS student_name
      FROM classes c
      JOIN users u ON c.student_id = u.user_id
      WHERE c.class_id = ?
      `,
        [class_id]
      );

      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lớp." });

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("❌ Lỗi lấy chi tiết lớp:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
