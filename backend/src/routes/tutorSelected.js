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
   ✅ Gia sư chấp nhận lời mời học → CẬP NHẬT lớp sang CẦN THANH TOÁN
============================================================ */
/* ============================================================
   ✅ Gia sư chấp nhận lời mời học → CẬP NHẬT lớp sang CẦN THANH TOÁN
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

      console.log("🟡 Tutor Accept Debug:", { request_id, user_id });

      // 1️⃣ Lấy tutor_id thật
      const [tutorRows] = await conn.query(
        "SELECT tutor_id FROM tutors WHERE user_id = ?",
        [user_id]
      );
      if (!tutorRows.length)
        return res
          .status(400)
          .json({ success: false, message: "Không tìm thấy hồ sơ gia sư." });

      const tutor_id = tutorRows[0].tutor_id;

      // 2️⃣ Lấy thông tin request & lớp
      const [reqRows] = await conn.query(
        "SELECT class_id, student_id FROM requests WHERE request_id = ? AND tutor_id = ?",
        [request_id, tutor_id]
      );
      if (!reqRows.length)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu phù hợp cho gia sư này.",
        });

      const { class_id, student_id } = reqRows[0];

      // 3️⃣ Lấy thông tin lớp để tính toán
      const [classRows] = await conn.query(
        "SELECT tuition_amount FROM classes WHERE class_id = ?",
        [class_id]
      );
      if (!classRows.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lớp học." });

      const tuition = Number(classRows[0].tuition_amount) || 0;

      // 4️⃣ Transaction bắt đầu
      await conn.beginTransaction();

      // 🟢 Cập nhật trạng thái request
      await conn.query(
        "UPDATE requests SET status = 'APPROVED' WHERE request_id = ?",
        [request_id]
      );

      // 🟢 Cập nhật lớp → Cần thanh toán
      const weeks = 1; // test nhanh
      const sessions_per_week = 1; // test nhanh
      const total_amount = tuition * weeks * sessions_per_week;

      await conn.query(
        `
        UPDATE classes 
        SET 
          tutor_id = ?, 
          selected_tutor_id = ?, 
          status = 'IN_PROGRESS',
          payment_status = 'PENDING_PAYMENT',
          weeks = ?, 
          sessions_per_week = ?, 
          total_amount = ?, 
          payment_deadline = DATE_ADD(NOW(), INTERVAL 1 MINUTE)
        WHERE class_id = ?
        `,
        [tutor_id, tutor_id, weeks, sessions_per_week, total_amount, class_id]
      );

      // 🟢 Gửi thông báo cho học viên
      await conn.query(
        `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          ?, 
          'Gia sư đã đồng ý dạy', 
          CONCAT('Lớp ', ? ,' đã được gia sư nhận. Vui lòng thanh toán để bắt đầu học.'), 
          'TUTOR_ACCEPT'
        )
        `,
        [student_id, class_id]
      );

      await conn.commit();

      console.log("✅ Tutor accepted & class updated:", {
        class_id,
        total_amount,
      });

      res.json({
        success: true,
        message:
          "✅ Gia sư đã đồng ý dạy. Lớp chuyển sang trạng thái CẦN THANH TOÁN.",
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Lỗi accept:", err.sqlMessage || err.message);
      res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message,
      });
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
