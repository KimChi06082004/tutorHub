import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* =========================================================
   📨 GỬI YÊU CẦU HỌC HOẶC DẠY (student ↔ tutor)
   ✅ Kiểm tra trùng lịch, giới hạn số lượng yêu cầu
========================================================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { class_id, message, tutor_id: inputTutorId } = req.body || {};
    const { role, user_id } = req.user;

    if (!class_id)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin lớp học." });

    // 🔍 Lấy thông tin lớp học
    const [classRows] = await pool.query(
      "SELECT student_id, subject, schedule FROM classes WHERE class_id=?",
      [class_id]
    );
    if (!classRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const { student_id, subject, schedule } = classRows[0];
    let sender_role, tutor_id, studentId, receiver_id;

    // ✅ Phân loại người gửi
    if (role === "student") {
      sender_role = "student";
      studentId = user_id;
      tutor_id = inputTutorId;
      receiver_id = tutor_id;

      if (!tutor_id)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu tutor_id." });
    } else if (role === "tutor") {
      sender_role = "tutor";
      studentId = student_id;

      const [tRows] = await pool.query(
        "SELECT tutor_id FROM tutors WHERE user_id=?",
        [user_id]
      );
      if (!tRows.length)
        return res
          .status(400)
          .json({ success: false, message: "Bạn chưa có hồ sơ gia sư." });
      tutor_id = tRows[0].tutor_id;
      receiver_id = student_id;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền gửi yêu cầu." });
    }

    // 🔁 Kiểm tra trùng yêu cầu đang chờ
    const [exist] = await pool.query(
      "SELECT * FROM requests WHERE student_id=? AND tutor_id=? AND class_id=? AND status='PENDING'",
      [studentId, tutor_id, class_id]
    );
    if (exist.length)
      return res.json({
        success: false,
        message: "❗ Yêu cầu này đã tồn tại, vui lòng chờ phản hồi.",
      });

    // ⚠️ Giới hạn 3 yêu cầu PENDING cho cùng 1 gia sư
    const [pendingCount] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM requests
       WHERE student_id=? AND tutor_id=? AND status='PENDING'`,
      [studentId, tutor_id]
    );

    if (pendingCount[0].count >= 3)
      return res.status(400).json({
        success: false,
        message:
          "⚠️ Bạn chỉ được gửi tối đa 3 yêu cầu chờ duyệt cùng một gia sư.",
      });

    // 🧭 Lấy toàn bộ lịch học đã gửi cho gia sư này
    const [existingRequests] = await pool.query(
      `
      SELECT c.schedule
      FROM requests r
      JOIN classes c ON r.class_id = c.class_id
      WHERE r.student_id=? AND r.tutor_id=? 
      AND r.status IN ('PENDING', 'APPROVED')
      `,
      [studentId, tutor_id]
    );

    // 🕒 Hàm chuyển giờ sang phút
    function parseTime(t) {
      if (!t || typeof t !== "string") return 0;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + (m || 0);
    }

    // 🧩 Hàm kiểm tra trùng lịch an toàn
    function isTimeConflict(scheduleA, scheduleB) {
      let newSchedule = scheduleA;
      let oldSchedule = scheduleB;

      // Nếu là JSON string thì parse
      if (typeof newSchedule === "string") {
        try {
          newSchedule = JSON.parse(newSchedule);
        } catch {
          newSchedule = {};
        }
      }
      if (typeof oldSchedule === "string") {
        try {
          oldSchedule = JSON.parse(oldSchedule);
        } catch {
          oldSchedule = {};
        }
      }

      const weeksA = Array.isArray(newSchedule?.weeks) ? newSchedule.weeks : [];
      const weeksB = Array.isArray(oldSchedule?.weeks) ? oldSchedule.weeks : [];

      const timeA = newSchedule?.timeRange || {};
      const timeB = oldSchedule?.timeRange || {};

      // Nếu không trùng ngày → bỏ qua
      const sameDay = weeksA.some((day) => weeksB.includes(day));
      if (!sameDay) return false;

      // Nếu trùng ngày → kiểm tra trùng giờ hoặc gần giờ
      const startA = parseTime(timeA.from);
      const endA = parseTime(timeA.to);
      const startB = parseTime(timeB.from);
      const endB = parseTime(timeB.to);

      if (!startA || !startB) return false;

      const diff = Math.min(Math.abs(startA - startB), Math.abs(endA - endB));

      // Nếu giờ học trùng hoặc cách nhau < 45 phút → trùng
      return diff < 45;
    }

    // 🧮 Parse lịch mới
    const newSchedule =
      typeof schedule === "string" ? JSON.parse(schedule) : schedule;

    for (const e of existingRequests) {
      const existingSchedule =
        typeof e.schedule === "string" ? JSON.parse(e.schedule) : e.schedule;

      if (isTimeConflict(newSchedule, existingSchedule)) {
        return res.status(400).json({
          success: false,
          message:
            "⚠️ Trùng lịch học: lớp này cùng ngày, cùng giờ hoặc cách <45 phút so với lớp khác đã gửi cho gia sư này.",
        });
      }
    }

    // 📨 Thêm yêu cầu mới
    await pool.query(
      `INSERT INTO requests (student_id, tutor_id, class_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [studentId, tutor_id, class_id, subject, message || ""]
    );

    // 🔔 Gửi thông báo cho đối phương
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

/* =========================================================
   📋 LẤY DANH SÁCH YÊU CẦU CỦA USER
========================================================= */
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
