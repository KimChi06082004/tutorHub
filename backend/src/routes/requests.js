import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRoles } from "../middlewares/auth.js";

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
      "SELECT student_id, subject, schedule FROM classes WHERE class_id=?",
      [class_id]
    );
    if (!classRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const { student_id, subject, schedule } = classRows[0];
    let tutor_id, studentId, receiver_id;

    if (role === "student") {
      // 🧩 Học viên gửi yêu cầu
      studentId = user_id;
      tutor_id = inputTutorId;
      receiver_id = tutor_id;
      if (!tutor_id)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu tutor_id." });
    } else if (role === "tutor") {
      // 🧩 Gia sư gửi yêu cầu
      studentId = student_id;

      // ✅ Kiểm tra gia sư đã có hồ sơ chưa
      const [tRows] = await pool.query(
        "SELECT tutor_id, status FROM tutors WHERE user_id = ?",
        [user_id]
      );

      if (!tRows.length) {
        return res.status(400).json({
          success: false,
          message: "Bạn cần hoàn thiện hồ sơ (CV) trước khi ứng tuyển lớp!",
        });
      }

      // ✅ Kiểm tra hồ sơ đã được duyệt chưa
      if (tRows[0].status !== "APPROVED") {
        return res.status(403).json({
          success: false,
          message:
            " Hồ sơ của bạn chưa được duyệt. Vui lòng chờ admin xét duyệt trước khi ứng tuyển lớp!",
        });
      }

      tutor_id = tRows[0].tutor_id;
      receiver_id = student_id;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền gửi yêu cầu." });
    }

    // 🧩 Kiểm tra trùng yêu cầu
    const [exist] = await pool.query(
      "SELECT * FROM requests WHERE student_id=? AND tutor_id=? AND class_id=? AND status='PENDING'",
      [studentId, tutor_id, class_id]
    );
    if (exist.length)
      return res.json({
        success: false,
        message: "❗ Yêu cầu này đã tồn tại, vui lòng chờ phản hồi.",
      });

    // 📨 Lưu yêu cầu mới
    await pool.query(
      `INSERT INTO requests (student_id, tutor_id, class_id, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [studentId, tutor_id, class_id, subject, message || ""]
    );

    // 🔔 Gửi thông báo
    if (role === "student") {
      // Học viên gửi yêu cầu → thông báo cho gia sư
      const [tutorUser] = await pool.query(
        "SELECT user_id FROM tutors WHERE tutor_id=?",
        [tutor_id]
      );
      if (tutorUser.length)
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'Học viên gửi yêu cầu học', ?, 'CLASS_UPDATE')`,
          [
            tutorUser[0].user_id,
            `Học viên đã gửi yêu cầu học cho lớp "${subject}" (Mã lớp: ${class_id}).`,
          ]
        );
    } else if (role === "tutor") {
      // Gia sư gửi yêu cầu → thông báo cho học viên
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Gia sư gửi lời mời dạy', ?, 'CLASS_UPDATE')`,
        [
          student_id,
          `Gia sư đã gửi lời mời dạy cho lớp "${subject}" (Mã lớp: ${class_id}).`,
        ]
      );
    }

    res.json({ success: true, message: "✅ Gửi yêu cầu thành công!" });
  } catch (err) {
    console.error("❌ Send request error:", err);
    res
      .status(500)
      .json({ success: false, message: err.sqlMessage || err.message });
  }
});

/* =========================================================
   👨‍🏫 GIA SƯ CHẤP NHẬN / TỪ CHỐI YÊU CẦU CỦA HỌC VIÊN
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

    // ✅ Lấy tutor_id thật
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
      "UPDATE requests SET status=?, responded_at=NOW() WHERE request_id=? AND tutor_id=?",
      [status, request_id, tutor_id]
    );

    // ✅ Nếu gia sư đồng ý → chuyển lớp sang chờ thanh toán
    if (status === "APPROVED") {
      await pool.query(
        `UPDATE classes 
         SET selected_tutor_id=?, 
             status='PENDING_PAYMENT',
             payment_status='PENDING_PAYMENT',
             visibility='PRIVATE'
         WHERE class_id=?`,
        [tutor_id, class_id]
      );
    }

    // 🔔 Thông báo cho học viên
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'CLASS_UPDATE')`,
      [
        student_id,
        status === "APPROVED"
          ? "Gia sư đã đồng ý dạy lớp"
          : "Gia sư đã từ chối yêu cầu học",
        status === "APPROVED"
          ? "Gia sư đã đồng ý nhận dạy lớp của bạn, chờ thanh toán."
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
   🧑‍🎓 HỌC VIÊN PHẢN HỒI YÊU CẦU CỦA GIA SƯ
========================================================= */
router.put(
  "/:id/respond",
  verifyToken,
  requireRoles(["student"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      const { user_id } = req.user;

      if (!["APPROVED", "REJECTED"].includes(status))
        return res
          .status(400)
          .json({ success: false, message: "Trạng thái không hợp lệ." });

      const [exist] = await pool.query(
        `SELECT r.tutor_id, r.class_id, c.student_id 
       FROM requests r
       JOIN classes c ON r.class_id = c.class_id
       WHERE r.request_id = ? AND c.student_id = ?`,
        [id, user_id]
      );

      if (!exist.length)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu hoặc bạn không có quyền.",
        });

      const { tutor_id, class_id } = exist[0];

      // ✅ Cập nhật trạng thái yêu cầu
      await pool.query(
        "UPDATE requests SET status=?, responded_at=NOW() WHERE request_id=?",
        [status, id]
      );

      if (status === "APPROVED") {
        // ✅ Cập nhật lớp sang chờ thanh toán
        await pool.query(
          `UPDATE classes 
         SET selected_tutor_id=?, 
             status='PENDING_PAYMENT',
             payment_status='PENDING_PAYMENT',
             visibility='PRIVATE'
         WHERE class_id=?`,
          [tutor_id, class_id]
        );
      }

      // 🔔 Gửi thông báo cho gia sư
      const [tutorUser] = await pool.query(
        "SELECT user_id FROM tutors WHERE tutor_id=?",
        [tutor_id]
      );
      if (tutorUser.length) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'CLASS_UPDATE')`,
          [
            tutorUser[0].user_id,
            status === "APPROVED"
              ? "Học viên đã đồng ý học"
              : "Học viên đã từ chối lời mời",
            status === "APPROVED"
              ? `Học viên đã đồng ý học lớp ${class_id}, chờ bạn thanh toán.`
              : `Học viên đã từ chối lời mời dạy lớp ${class_id}.`,
          ]
        );
      }

      res.json({
        success: true,
        message:
          status === "APPROVED"
            ? "🎯 Bạn đã đồng ý để gia sư dạy lớp này."
            : "❌ Bạn đã từ chối lời mời của gia sư.",
      });
    } catch (err) {
      console.error("❌ Respond request error:", err);
      res
        .status(500)
        .json({ success: false, message: err.sqlMessage || err.message });
    }
  }
);

/* =========================================================
   📋 LẤY DANH SÁCH YÊU CẦU CỦA NGƯỜI DÙNG
========================================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query, params;

    if (role === "student") {
      query = `
        SELECT r.request_id, r.class_id, r.subject, r.message, r.status, 
               r.created_at, c.grade, 
               u.full_name AS tutor_name, t.avatar AS tutor_avatar
        FROM requests r
        JOIN classes c ON r.class_id = c.class_id
        LEFT JOIN tutors t ON r.tutor_id = t.tutor_id
        LEFT JOIN users u ON t.user_id = u.user_id
        WHERE c.student_id = ?
        ORDER BY r.created_at DESC
      `;
      params = [user_id];
    } else if (role === "tutor") {
      query = `
        SELECT r.request_id, r.class_id, r.subject, r.message, r.status,
               r.created_at, c.grade, u.full_name AS student_name
        FROM requests r
        JOIN tutors t ON r.tutor_id = t.tutor_id
        JOIN classes c ON r.class_id = c.class_id
        LEFT JOIN users u ON u.user_id = c.student_id
        WHERE t.user_id = ?
        ORDER BY r.created_at DESC
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
    console.error("❌ Get requests error:", err);
    res
      .status(500)
      .json({ success: false, message: err.sqlMessage || err.message });
  }
});

/* =========================================================
   ✅ Kiểm tra xem tutor đã ứng tuyển vào lớp chưa
   GET /api/requests/check/:classId
========================================================= */
router.get(
  "/check/:classId",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const tutor_id = (
        await pool.query("SELECT tutor_id FROM tutors WHERE user_id = ?", [
          req.user.user_id,
        ])
      )[0][0]?.tutor_id;

      if (!tutor_id)
        return res.status(400).json({
          success: false,
          message: "Bạn cần hoàn thiện hồ sơ (CV) trước khi ứng tuyển lớp!",
        });

      const [rows] = await pool.query(
        "SELECT * FROM requests WHERE tutor_id = ? AND class_id = ?",
        [tutor_id, req.params.classId]
      );

      res.json({ success: true, applied: rows.length > 0 });
    } catch (err) {
      console.error("❌ Lỗi kiểm tra ứng tuyển:", err);
      res.status(500).json({ success: false, message: "Lỗi server." });
    }
  }
);
export default router;
