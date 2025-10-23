import express from "express";
import { pool } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

/**
 * 🧩 GỬI YÊU CẦU HỌC HOẶC DẠY (student ↔ tutor)
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { class_id, message, tutor_id: inputTutorId } = req.body || {};
    const { role, user_id } = req.user;

    if (!class_id)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin lớp học." });

    console.log("🧩 Body nhận được:", req.body);
    console.log("👤 Role:", role, "| UserID:", user_id);

    // Lấy thông tin lớp
    const [classRows] = await pool.query(
      "SELECT student_id, subject FROM classes WHERE class_id=?",
      [class_id]
    );
    if (!classRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const { student_id, subject } = classRows[0];

    let sender_role, receiver_id, tutor_id, studentId;

    // 📘 Nếu người gửi là học viên → gửi yêu cầu học đến tutor
    if (role === "student") {
      sender_role = "student";
      studentId = user_id;
      tutor_id = inputTutorId || null;
      receiver_id = tutor_id;

      if (!tutor_id)
        return res.status(400).json({
          success: false,
          message: "Thiếu tutor_id để gửi yêu cầu học.",
        });
    }
    // 👨‍🏫 Nếu người gửi là gia sư → gửi yêu cầu dạy đến học viên
    else if (role === "tutor") {
      sender_role = "tutor";
      tutor_id = user_id;
      studentId = student_id;
      receiver_id = student_id;
    } else {
      return res.status(403).json({
        success: false,
        message: "Chỉ tutor hoặc student mới được gửi yêu cầu.",
      });
    }

    // 🔎 Kiểm tra trùng yêu cầu đang chờ
    const [exist] = await pool.query(
      "SELECT * FROM requests WHERE student_id=? AND tutor_id=? AND class_id=? AND status='PENDING'",
      [studentId, tutor_id, class_id]
    );
    if (exist.length > 0)
      return res.json({
        success: false,
        message: "❗ Yêu cầu này đã tồn tại, vui lòng chờ phản hồi.",
      });

    // 📨 Tạo yêu cầu mới
    await pool.query(
      `INSERT INTO requests (student_id, tutor_id, class_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [studentId, tutor_id, class_id, subject || "", message || ""]
    );

    // 🛎️ Gửi thông báo
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

/**
 * 🧩 XEM DANH SÁCH YÊU CẦU (theo role)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query, params;

    if (role === "tutor") {
      query = `
        SELECT r.*, u.full_name AS student_name, u.email
        FROM requests r
        JOIN users u ON r.student_id = u.user_id
        WHERE r.tutor_id=? ORDER BY r.created_at DESC`;
      params = [user_id];
    } else if (role === "student") {
      query = `
        SELECT r.*, u.full_name AS tutor_name, u.email
        FROM requests r
        JOIN users u ON r.tutor_id = u.user_id
        WHERE r.student_id=? ORDER BY r.created_at DESC`;
      params = [user_id];
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập." });
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get requests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 🧩 TUTOR CHẤP NHẬN / TỪ CHỐI YÊU CẦU
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const tutor_id = req.user.user_id;
    const request_id = req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ." });

    const [result] = await pool.query(
      "UPDATE requests SET status=? WHERE request_id=? AND tutor_id=?",
      [status, request_id, tutor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu hoặc bạn không có quyền cập nhật.",
      });

    res.json({
      success: true,
      message: `✅ Yêu cầu đã được ${
        status === "APPROVED" ? "chấp nhận" : "từ chối"
      }.`,
    });
  } catch (err) {
    console.error("❌ Tutor update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 🧩 STUDENT CHẤP NHẬN / TỪ CHỐI GIA SƯ ỨNG TUYỂN
 */
router.put("/:id/respond", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const student_id = req.user.user_id;
    const request_id = req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ." });

    const [result] = await pool.query(
      "UPDATE requests SET status=? WHERE request_id=? AND student_id=?",
      [status, request_id, student_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu phù hợp hoặc không có quyền cập nhật.",
      });

    // Gửi thông báo cho tutor
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (
         (SELECT tutor_id FROM requests WHERE request_id=?),
         ?, ?, 'REQUEST'
       )`,
      [
        request_id,
        status === "APPROVED"
          ? "Yêu cầu dạy đã được chấp nhận"
          : "Yêu cầu dạy đã bị từ chối",
        status === "APPROVED"
          ? "Học viên đã chấp nhận bạn dạy lớp của họ."
          : "Học viên đã từ chối lời mời dạy của bạn.",
      ]
    );

    res.json({
      success: true,
      message: `✅ Bạn đã ${
        status === "APPROVED" ? "chấp nhận" : "từ chối"
      } lời mời dạy.`,
    });
  } catch (err) {
    console.error("❌ Student respond error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
