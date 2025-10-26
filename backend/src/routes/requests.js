import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* =========================================================
   📨 GỬI YÊU CẦU HỌC HOẶC DẠY (student ↔ tutor)
========================================================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { class_id, message, tutor_id: inputTutorId } = req.body || {};
    const { role, user_id } = req.user;

    if (!class_id)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin lớp học." });

    // 🔍 Lấy thông tin lớp
    const [classRows] = await pool.query(
      "SELECT student_id, subject FROM classes WHERE class_id=?",
      [class_id]
    );
    if (!classRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const { student_id, subject } = classRows[0];

    let sender_role, tutor_id, studentId, receiver_id;

    if (role === "student") {
      // 🎯 Học viên gửi yêu cầu học → Gia sư
      sender_role = "student";
      studentId = user_id;
      tutor_id = inputTutorId;

      if (!tutor_id)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu tutor_id." });

      receiver_id = tutor_id; // người nhận thông báo là tutor
    } else if (role === "tutor") {
      // 🎯 Gia sư gửi yêu cầu dạy → Học viên
      sender_role = "tutor";
      studentId = student_id;

      // ✅ Lấy tutor_id thật từ bảng tutors
      const [tRows] = await pool.query(
        "SELECT tutor_id FROM tutors WHERE user_id=?",
        [user_id]
      );
      if (!tRows.length)
        return res
          .status(400)
          .json({ success: false, message: "Bạn chưa có hồ sơ gia sư." });
      tutor_id = tRows[0].tutor_id;

      receiver_id = student_id; // người nhận thông báo là student
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền gửi yêu cầu." });
    }

    // 🔁 Kiểm tra trùng
    const [exist] = await pool.query(
      "SELECT * FROM requests WHERE student_id=? AND tutor_id=? AND class_id=? AND status='PENDING'",
      [studentId, tutor_id, class_id]
    );
    if (exist.length)
      return res.json({
        success: false,
        message: "❗ Yêu cầu này đã tồn tại, vui lòng chờ phản hồi.",
      });

    // 📨 Tạo mới
    await pool.query(
      `INSERT INTO requests (student_id, tutor_id, class_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [studentId, tutor_id, class_id, subject, message || ""]
    );

    // 🔔 Gửi thông báo
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'REQUEST')`,
      [
        receiver_id,
        sender_role === "student" ? "Yêu cầu học mới" : "Yêu cầu dạy mới",
        sender_role === "student"
          ? "Một học viên vừa gửi yêu cầu học cho bạn."
          : "Một gia sư vừa gửi yêu cầu dạy lớp của bạn.",
      ]
    );

    res.json({ success: true, message: "✅ Gửi yêu cầu thành công!" });
  } catch (err) {
    console.error("❌ Send request error:", err);
    res
      .status(500)
      .json({ success: false, message: err.sqlMessage || err.message });
  }
});

/* =========================================================
   ✏️ GIA SƯ ỨNG TUYỂN LỚP
========================================================= */
router.post("/apply", verifyToken, requireRole(["tutor"]), async (req, res) => {
  try {
    const { class_id, message } = req.body;
    const user_id = req.user.user_id;

    // ✅ Lấy tutor_id
    const [tRows] = await pool.query(
      "SELECT tutor_id, status FROM tutors WHERE user_id=?",
      [user_id]
    );
    if (!tRows.length)
      return res.status(400).json({
        success: false,
        message: "Bạn cần hoàn thiện hồ sơ gia sư trước khi ứng tuyển.",
      });

    const { tutor_id, status } = tRows[0];
    if (status !== "APPROVED")
      return res.status(400).json({
        success: false,
        message:
          "❗ Hồ sơ gia sư của bạn chưa được duyệt, không thể ứng tuyển.",
      });

    // ✅ Lấy thông tin lớp
    const [cls] = await pool.query(
      "SELECT student_id, subject FROM classes WHERE class_id=?",
      [class_id]
    );
    if (!cls.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const { student_id, subject } = cls[0];

    // ✅ Kiểm tra trùng
    const [dup] = await pool.query(
      "SELECT * FROM requests WHERE class_id=? AND tutor_id=? AND status='PENDING'",
      [class_id, tutor_id]
    );
    if (dup.length)
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã ứng tuyển lớp này rồi!" });

    // ✅ Thêm request
    await pool.query(
      `INSERT INTO requests (student_id, tutor_id, class_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [student_id, tutor_id, class_id, subject, message || ""]
    );

    // ✅ Thông báo học viên
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Gia sư ứng tuyển', 'Một gia sư vừa ứng tuyển lớp của bạn.', 'REQUEST')`,
      [student_id]
    );

    res.json({ success: true, message: "✅ Ứng tuyển lớp thành công!" });
  } catch (err) {
    console.error("❌ Tutor apply error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   👨‍🏫 GIA SƯ CHẤP NHẬN / TỪ CHỐI YÊU CẦU HỌC VIÊN
========================================================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const user_id = req.user.user_id;
    const request_id = req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ." });

    // ✅ Lấy tutor_id
    const [tutorRows] = await pool.query(
      "SELECT tutor_id FROM tutors WHERE user_id=?",
      [user_id]
    );
    if (!tutorRows.length)
      return res
        .status(400)
        .json({ success: false, message: "Không tìm thấy hồ sơ gia sư." });
    const tutor_id = tutorRows[0].tutor_id;

    const [reqRows] = await pool.query(
      "SELECT class_id, student_id FROM requests WHERE request_id=?",
      [request_id]
    );
    if (!reqRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy yêu cầu này." });

    const { class_id, student_id } = reqRows[0];

    await pool.query(
      "UPDATE requests SET status=? WHERE request_id=? AND tutor_id=?",
      [status, request_id, tutor_id]
    );

    if (status === "APPROVED") {
      await pool.query(
        "UPDATE classes SET tutor_id=?, status='ASSIGNED' WHERE class_id=?",
        [tutor_id, class_id]
      );
    }

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'REQUEST')`,
      [
        student_id,
        status === "APPROVED"
          ? "Gia sư đã chấp nhận yêu cầu học"
          : "Gia sư đã từ chối yêu cầu học",
        status === "APPROVED"
          ? "Gia sư đã đồng ý nhận dạy lớp của bạn."
          : "Gia sư đã từ chối lời mời học của bạn.",
      ]
    );

    res.json({
      success: true,
      message: `✅ Yêu cầu đã được ${
        status === "APPROVED" ? "chấp nhận" : "từ chối"
      }.`,
    });
  } catch (err) {
    console.error("❌ Tutor respond error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;

    let query, params;
    if (role === "student") {
      query = `
        SELECT * FROM requests WHERE student_id = ? ORDER BY created_at DESC
      `;
      params = [user_id];
    } else if (role === "tutor") {
      query = `
        SELECT * FROM requests WHERE tutor_id = ? ORDER BY created_at DESC
      `;
      params = [user_id];
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập." });
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
