import express from "express";
import { pool } from "../config/db.js";
import { verifyToken } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/roles.js";

const router = express.Router();

/* =========================================================
   POST /api/classes (student tạo lớp → chờ admin duyệt)
========================================================= */
router.post("/", verifyToken, requireRoles("student"), async (req, res) => {
  try {
    const {
      subject,
      grade,
      schedule,
      tuition_amount,
      lat,
      lng,
      city,
      district,
      ward,
      address,
      teacher_gender,
      age_range,
      education_level,
      experience,
      description,
    } = req.body || {};

    if (!subject || !grade || !schedule || !tuition_amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc.",
      });
    }

    const scheduleData = schedule
      ? typeof schedule === "object"
        ? JSON.stringify(schedule)
        : schedule
      : "{}";

    const finalLat = isNaN(parseFloat(lat)) ? 10.7769 : parseFloat(lat);
    const finalLng = isNaN(parseFloat(lng)) ? 106.7009 : parseFloat(lng);
    const finalTuition = parseFloat(tuition_amount);
    const studentId = req.user.user_id || req.user.id;

    // ✅ Fix lỗi: ép age_range thành chuỗi (vd: "18-60")
    const ageRangeValue = Array.isArray(age_range)
      ? age_range.join("-")
      : age_range || "Không giới hạn";

    const sql = `
      INSERT INTO classes (
        student_id, subject, grade, schedule, tuition_amount,
        visibility, status, lat, lng, city,
        district, ward, address,
        teacher_gender, age_range, education_level, experience, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      studentId,
      subject,
      grade,
      scheduleData,
      finalTuition,
      "PRIVATE",
      "PENDING",
      finalLat,
      finalLng,
      city || "Hồ Chí Minh",
      district || null,
      ward || null,
      address || null,
      teacher_gender || "Không yêu cầu",
      ageRangeValue, // ✅ đã fix
      education_level || "Không yêu cầu",
      experience || "Không yêu cầu",
      description || "",
    ];

    console.log("🧩 SQL query:", sql);
    console.log("🧩 Values:", values);

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      success: true,
      message: "✅ Lớp đã được tạo, chờ admin duyệt.",
      data: { class_id: result.insertId },
    });
  } catch (err) {
    console.error("❌ Create class error:", err.sqlMessage || err.message);
    res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  }
});

/* =========================================================
   PUT /api/classes/:id/approve (admin duyệt lớp)
========================================================= */
router.put(
  "/:id/approve",
  verifyToken,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT status FROM classes WHERE class_id=?",
        [req.params.id]
      );
      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lớp học." });

      const current = rows[0].status;
      if (["APPROVED_VISIBLE", "REJECTED", "DONE"].includes(current)) {
        return res.status(400).json({
          success: false,
          message: "Lớp đã được xử lý, không thể duyệt lại.",
        });
      }

      // ✅ Cập nhật trạng thái & công khai lớp
      await pool.query(
        "UPDATE classes SET status='APPROVED_VISIBLE', visibility='PUBLIC' WHERE class_id=?",
        [req.params.id]
      );

      res.json({
        success: true,
        message: "✅ Lớp đã được duyệt và hiển thị công khai.",
      });
    } catch (err) {
      console.error("❌ Approve class error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   PUT /api/classes/:id/reject (admin từ chối lớp)
========================================================= */
router.put(
  "/:id/reject",
  verifyToken,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const reason = req.body?.reason || "Không có lý do";
      await pool.query(
        "UPDATE classes SET status=?, visibility=?, admin_reject_reason=?, admin_reject_at=NOW() WHERE class_id=?",
        ["REJECTED", "PRIVATE", reason, req.params.id]
      );
      res.json({ success: true, message: "❌ Lớp đã bị từ chối." });
    } catch (err) {
      console.error("❌ Reject class error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =========================================================
   GET /api/classes (gia sư: chỉ thấy lớp công khai đã duyệt)
========================================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { subject } = req.query || {};
    const role = req.user.role;
    const userId = req.user.user_id || req.user.id;

    let sql = `
      SELECT c.class_id, c.subject, c.grade, c.schedule, 
             c.tuition_amount, c.status, c.lat, c.lng, 
             c.city, c.district, c.ward,
             u.full_name AS student_name
      FROM classes c 
      JOIN users u ON u.user_id = c.student_id 
      WHERE 1=1
    `;
    const params = [];

    if (role === "student") {
      sql += " AND c.student_id = ?";
      params.push(userId);
    } else if (role === "tutor") {
      sql +=
        " AND c.status = 'APPROVED_VISIBLE' AND c.visibility = 'PUBLIC' AND c.selected_tutor_id IS NULL";
    }

    if (subject) {
      sql += " AND c.subject LIKE ?";
      params.push(`%${subject}%`);
    }

    sql += " ORDER BY c.created_at DESC";
    const [rows] = await pool.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Classes list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   PUT /api/classes/:id/select-tutor (student chọn tutor)
========================================================= */
router.put(
  "/:id/select-tutor",
  verifyToken,
  requireRoles("student"),
  async (req, res) => {
    try {
      const { tutor_id } = req.body || {};
      const [own] = await pool.query(
        "SELECT student_id FROM classes WHERE class_id=?",
        [req.params.id]
      );

      if (!own.length || own[0].student_id !== req.user.user_id)
        return res.status(403).json({ success: false, message: "Forbidden" });

      // ✅ Khi chọn gia sư → chuyển sang IN_PROGRESS, ẩn lớp
      await pool.query(
        "UPDATE classes SET selected_tutor_id=?, status=?, visibility=? WHERE class_id=?",
        [tutor_id, "IN_PROGRESS", "PRIVATE", req.params.id]
      );

      res.json({
        success: true,
        message: "🎯 Gia sư đã được chọn, lớp chuyển sang trạng thái đang học.",
        class_status: "IN_PROGRESS",
      });
    } catch (err) {
      console.error("❌ Select tutor error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   PUT /api/classes/:id/complete (admin hoặc tutor kết thúc)
========================================================= */
router.put("/:id/complete", verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT selected_tutor_id FROM classes WHERE class_id=?",
      [req.params.id]
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });

    if (userRole !== "admin" && userId !== rows[0].selected_tutor_id)
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền hoàn tất lớp này" });

    await pool.query(
      "UPDATE classes SET status=?, visibility=?, completed_at=NOW() WHERE class_id=?",
      ["DONE", "PRIVATE", req.params.id]
    );

    res.json({
      success: true,
      message: "🏁 Lớp đã hoàn tất.",
      class_status: "DONE",
    });
  } catch (err) {
    console.error("❌ Complete class error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   GET /api/classes/mine (học viên xem lớp đã đăng)
========================================================= */
router.get("/mine", verifyToken, requireRoles("student"), async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT class_id, subject, grade, schedule, tuition_amount, 
              status, visibility, created_at, city, district, ward
       FROM classes
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get my classes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   PUT /api/classes/:id/approve-cancel (admin duyệt yêu cầu hủy)
========================================================= */
router.put(
  "/:id/approve-cancel",
  verifyToken,
  requireRoles("admin"),
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE classes SET status=?, visibility=? WHERE class_id=?",
        ["CANCELLED", "PRIVATE", req.params.id]
      );
      res.json({ success: true, message: "✅ Lớp đã được duyệt hủy." });
    } catch (err) {
      console.error("❌ Approve cancel error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   DELETE /api/classes/:id (admin xóa lớp)
========================================================= */
router.delete("/:id", verifyToken, requireRoles("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status FROM classes WHERE class_id=?",
      [req.params.id]
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    const current = rows[0].status;
    if (["IN_PROGRESS"].includes(current)) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa lớp đang được dạy.",
      });
    }

    await pool.query("DELETE FROM classes WHERE class_id=?", [req.params.id]);
    res.json({ success: true, message: "🗑️ Lớp đã bị xóa vĩnh viễn." });
  } catch (err) {
    console.error("❌ Delete class error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   GET /api/classes/:id (chi tiết lớp cho tutor / student)
========================================================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.class_id, c.student_id, c.subject, c.grade, c.schedule, 
         c.tuition_amount, c.visibility, c.status, c.lat, c.lng, 
         c.city, c.district, c.ward, c.address, 
         c.teacher_gender, c.age_range, c.education_level, c.experience, c.description,
         u.full_name, s.avatar
       FROM classes c
       JOIN users u ON c.student_id = u.user_id
       LEFT JOIN students s ON s.student_id = c.student_id
       WHERE c.class_id = ?`,
      [req.params.id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp." });

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ Get class detail error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 🧩 Học viên hủy lớp đã đăng
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    console.log("✅ Token decoded:", req.user);

    const class_id = req.params.id;
    const { reason } = req.body;
    const { user_id, role } = req.user;

    if (role !== "student") {
      return res
        .status(403)
        .json({ success: false, message: "Chỉ học viên mới được hủy lớp." });
    }

    // 🧐 Kiểm tra lớp có thuộc học viên không
    const [check] = await pool.query(
      "SELECT * FROM classes WHERE class_id=? AND student_id=?",
      [class_id, user_id]
    );

    if (!check.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp hoặc bạn không có quyền hủy lớp này.",
      });
    }

    // 🔄 Cập nhật trạng thái lớp
    await pool.query(
      "UPDATE classes SET status='CANCELLED', cancel_reason=? WHERE class_id=?",
      [reason || "Người học hủy lớp", class_id]
    );

    // 🛎️ Gửi thông báo cho admin (nếu cần)
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (1, 'Lớp bị hủy', CONCAT('Học viên đã hủy lớp ', ?), 'CLASS')`,
      [class_id]
    );

    res.json({
      success: true,
      message: "✅ Bạn đã hủy lớp thành công.",
    });
  } catch (err) {
    console.error("❌ Cancel class error:", err);
    res
      .status(500)
      .json({ success: false, message: err.sqlMessage || err.message });
  }
});
// 🧭 Lấy lớp đã đăng
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const [rows] = await pool.query(
      "SELECT class_id, subject, tuition_amount, city, status FROM classes WHERE student_id = ?",
      [studentId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get student classes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🧭 Lấy lớp kế tiếp (tự động bỏ qua lớp không tồn tại)
router.get("/next/:id", async (req, res) => {
  try {
    const currentId = parseInt(req.params.id);
    const [rows] = await pool.query(
      `SELECT class_id 
       FROM classes 
       WHERE class_id > ? 
       ORDER BY class_id ASC 
       LIMIT 1`,
      [currentId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Đây là lớp cuối cùng.",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy lớp kế tiếp:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lớp kế tiếp.",
    });
  }
});

export default router;
