import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRoles } from "../middlewares/auth.js";
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
    let ageRangeValue = null;

    // Nếu người dùng nhập số hoặc chuỗi thì giữ nguyên
    if (typeof age_range === "string" && age_range.trim() !== "") {
      ageRangeValue = age_range.trim();
    } else if (Array.isArray(age_range)) {
      ageRangeValue = age_range.join("-");
    } else {
      ageRangeValue = null; // ❌ Không ép mặc định 18–60
    }

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
    console.log(" SQL query:", sql);
    console.log(" Values:", values);

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      success: true,
      message: " Lớp đã được tạo, chờ admin duyệt.",
      data: { class_id: result.insertId },
    });
  } catch (err) {
    console.error(" Create class error:", err.sqlMessage || err.message);
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
        message: "Lớp đã được duyệt và hiển thị công khai.",
      });
    } catch (err) {
      console.error(" Approve class error:", err);
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
      res.json({ success: true, message: " Lớp đã bị từ chối." });
    } catch (err) {
      console.error(" Reject class error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =========================================================
   GET /api/classes (gia sư: chỉ thấy lớp công khai đã duyệt)
========================================================= */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const { subject } = req.query || {};
//     const role = req.user.role;
//     const userId = req.user.user_id || req.user.id;

//     let sql = `
//       SELECT c.class_id, c.subject, c.grade, c.schedule,
//              c.tuition_amount, c.status, c.lat, c.lng,
//              c.city, c.district, c.ward,
//              u.full_name AS student_name
//       FROM classes c
//       JOIN users u ON u.user_id = c.student_id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (role === "student") {
//       sql += " AND c.student_id = ?";
//       params.push(userId);
//     } else if (role === "tutor") {
//       sql +=
//         " AND c.status = 'APPROVED_VISIBLE' AND c.visibility = 'PUBLIC' AND c.selected_tutor_id IS NULL";
//     }

//     if (subject) {
//       sql += " AND c.subject LIKE ?";
//       params.push(`%${subject}%`);
//     }

//     sql += " ORDER BY c.created_at DESC";
//     const [rows] = await pool.query(sql, params);

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error("❌ Classes list error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

router.get("/", verifyToken, async (req, res) => {
  try {
    const { subject, teacher_gender, city } = req.query || {};
    const { role, user_id } = req.user;

    let sql = `
      SELECT 
        c.class_id, c.subject, c.grade, c.schedule, 
        c.tuition_amount, c.status, c.lat, c.lng, 
        c.city, c.district, c.ward, c.teacher_gender,
        u.full_name AS student_name
      FROM classes c
      JOIN users u ON u.user_id = c.student_id
      WHERE 1=1
    `;
    const params = [];

    // 🎯 Quyền xem lớp
    if (role === "student") {
      sql += " AND c.student_id = ?";
      params.push(user_id);
    } else if (role === "tutor") {
      sql +=
        " AND c.status = 'APPROVED_VISIBLE' AND c.visibility = 'PUBLIC' AND c.selected_tutor_id IS NULL";
    }

    // 🔍 Lọc theo môn học
    if (subject && subject.trim() !== "") {
      sql += " AND c.subject LIKE ?";
      params.push(`%${subject}%`);
    }

    // 👩‍🏫 Lọc theo giới tính yêu cầu
    if (
      teacher_gender &&
      teacher_gender.trim() !== "" &&
      teacher_gender !== "Không yêu cầu"
    ) {
      sql +=
        " AND (c.teacher_gender = ? OR c.teacher_gender = 'Không yêu cầu')";
      params.push(teacher_gender);
    }

    // 🌆 Lọc theo thành phố
    if (city && city.trim() !== "") {
      sql += " AND c.city LIKE ?";
      params.push(`%${city}%`);
    }

    sql += " ORDER BY c.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(" Lỗi khi tìm kiếm lớp:", err);
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
        message: " Gia sư đã được chọn, lớp chuyển sang trạng thái đang học.",
        class_status: "IN_PROGRESS",
      });
    } catch (err) {
      console.error(" Select tutor error:", err);
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
      message: "Lớp đã hoàn tất.",
      class_status: "DONE",
    });
  } catch (err) {
    console.error(" Complete class error:", err);
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
    console.error(" Get my classes error:", err);
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
      res.json({ success: true, message: " Lớp đã được duyệt hủy." });
    } catch (err) {
      console.error(" Approve cancel error:", err);
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
    res.json({ success: true, message: " Lớp đã bị xóa vĩnh viễn." });
  } catch (err) {
    console.error(" Delete class error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   🧮 ADMIN – Danh sách lớp có tìm kiếm & phân trang
   GET /api/classes/admin?page=1&limit=10&search=Toán
========================================================= */
router.get("/admin", verifyToken, requireRoles(["admin"]), async (req, res) => {
  try {
    let { page = 1, limit = 5, status, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // ✅ Base WHERE
    let whereClause = "WHERE 1=1";
    const params = [];

    // Lọc trạng thái nếu có
    if (status) {
      whereClause += " AND c.status = ?";
      params.push(status);
    }

    // 🔍 Tìm kiếm theo mã lớp, môn học hoặc tên học viên
    if (search && search.trim() !== "") {
      whereClause +=
        " AND (c.class_id LIKE ? OR c.subject LIKE ? OR u.full_name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // ✅ Tổng bản ghi
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM classes c
         JOIN users u ON c.student_id = u.user_id
         ${whereClause}`,
      params
    );

    // ✅ Dữ liệu từng trang
    const [rows] = await pool.query(
      `
        SELECT 
          c.class_id, c.subject, c.grade, c.schedule, 
          c.tuition_amount, c.status, c.visibility,
          c.city, c.district, c.ward, c.created_at,
          u.full_name AS student_name
        FROM classes c
        JOIN users u ON c.student_id = u.user_id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    });
  } catch (err) {
    console.error(" Admin class search error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm lớp học.",
    });
  }
});

// 🧩 Học viên hủy lớp đã đăng (ĐẶT TRƯỚC route /:id để tránh xung đột)
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    console.log(" Cancel class request - Token decoded:", req.user);
    console.log(" Class ID:", req.params.id);

    const class_id = req.params.id;
    const { reason } = req.body;
    const { user_id, role } = req.user;

    // ✅ Kiểm tra role
    if (role !== "student") {
      console.log(" Role check failed. Current role:", role);
      return res
        .status(403)
        .json({ success: false, message: "Chỉ học viên mới được hủy lớp." });
    }

    // 🧐 Kiểm tra lớp có thuộc học viên không
    console.log(" Checking class ownership:", { class_id, user_id });
    const [check] = await pool.query(
      "SELECT * FROM classes WHERE class_id=? AND student_id=?",
      [class_id, user_id]
    );

    if (!check.length) {
      console.log(" Class not found or no permission");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp hoặc bạn không có quyền hủy lớp này.",
      });
    }

    console.log(" Class found:", check[0]);

    // 🔄 Cập nhật trạng thái lớp
    console.log("Updating class status to CANCELLED...");
    const [updateResult] = await pool.query(
      "UPDATE classes SET status='CANCELLED', visibility='PRIVATE' WHERE class_id=?",
      [class_id]
    );
    console.log(" Update result:", updateResult);

    // 🛎️ Gửi thông báo cho học viên xác nhận (bỏ qua nếu lỗi)
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Lớp đã hủy', 'Lớp học của bạn đã được hủy thành công.', 'CLASS')`,
        [user_id]
      );
      console.log(" Notification sent");
    } catch (notifErr) {
      console.log(" Failed to send notification:", notifErr.message);
      // Không throw error, vì đã hủy lớp thành công
    }

    res.json({
      success: true,
      message: " Bạn đã hủy lớp thành công.",
    });
  } catch (err) {
    console.error(" Cancel class error:", err);
    res
      .status(500)
      .json({ success: false, message: err.sqlMessage || err.message });
  }
});

/* =========================================================
   💰 API: Thống kê doanh thu theo tháng (Hiển thị đủ 12 tháng)
========================================================= */
router.get("/revenue", verifyToken, requireRoles("admin"), async (req, res) => {
  try {
    const { year, month } = req.query;
    const params = [];
    let where = "WHERE status = 'SUCCESS'";

    // ✅ Nếu có năm → lọc theo năm
    if (year) {
      where += " AND YEAR(created_at) = ?";
      params.push(year);
    }

    // ✅ Nếu có tháng → lọc theo tháng cụ thể
    if (month) {
      where += " AND MONTH(created_at) = ?";
      params.push(month);
    }

    let sql;

    if (month) {
      // 🔹 Nếu có tháng → chỉ trả về dữ liệu tháng đó
      sql = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') AS month,
          SUM(amount) AS total_revenue,
          COUNT(*) AS total_transactions
        FROM payments
        ${where}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `;
    } else {
      // 🔹 Nếu không có tháng → trả về đủ 12 tháng trong năm (kể cả tháng không có doanh thu)
      sql = `
        SELECT 
          months.month AS month,
          COALESCE(SUM(p.amount), 0) AS total_revenue,
          COALESCE(COUNT(p.payment_id), 0) AS total_transactions
        FROM (
          SELECT DATE_FORMAT(CONCAT(?, '-', m, '-01'), '%Y-%m') AS month
          FROM (
            SELECT 1 AS m UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
            UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
          ) AS months_table
        ) AS months
        LEFT JOIN payments p ON DATE_FORMAT(p.created_at, '%Y-%m') = months.month AND p.status = 'SUCCESS'
        GROUP BY months.month
        ORDER BY months.month ASC
      `;
      params.unshift(year || new Date().getFullYear());
    }

    const [rows] = await pool.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Lỗi khi truy vấn doanh thu:", err);
    res.status(500).json({
      success: false,
      message: "Không thể lấy dữ liệu doanh thu.",
    });
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
    console.error(" Get class detail error:", err);
    return res.status(500).json({ success: false, message: err.message });
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
    console.error(" Lỗi khi lấy lớp kế tiếp:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lớp kế tiếp.",
    });
  }
});
/* =========================================================
   🟡 3. DANH SÁCH LỚP CẦN THANH TOÁN
========================================================= */
router.get("/payment/pending", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query;

    if (role === "tutor") {
      query = `
        SELECT c.class_id, c.subject, c.grade, c.tuition_amount, c.status, c.payment_status,
               u.full_name AS student_name, u.email AS student_email
        FROM classes c
        JOIN users u ON u.user_id = c.student_id
        WHERE c.selected_tutor_id = (SELECT tutor_id FROM tutors WHERE user_id = ?)
        AND c.payment_status = 'PENDING_PAYMENT'
        AND c.status NOT IN ('CANCELLED','DONE')`;
    } else if (role === "student") {
      query = `
        SELECT c.class_id, c.subject, c.grade, c.tuition_amount, c.status, c.payment_status,
               t.tutor_id, u.full_name AS tutor_name, u.email AS tutor_email
        FROM classes c
        JOIN tutors t ON c.selected_tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        WHERE c.student_id = ?
        AND c.payment_status = 'PENDING_PAYMENT'
        AND c.status NOT IN ('CANCELLED','DONE')`;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền." });
    }

    const [rows] = await pool.query(query, [user_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(" Get pending payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   ⏰ HẾT HẠN THANH TOÁN
========================================================= */
router.put("/:id/expire-payment", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT payment_status FROM classes WHERE class_id=?",
      [id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lớp học." });

    if (rows[0].payment_status !== "PENDING_PAYMENT")
      return res.json({
        success: false,
        message: "Lớp này không còn trong trạng thái chờ thanh toán.",
      });

    await pool.query(
      "UPDATE classes SET payment_status='EXPIRED', status='CANCELLED' WHERE class_id=?",
      [id]
    );

    res.json({
      success: true,
      message: " Lớp đã hết hạn thanh toán và bị hủy.",
    });
  } catch (err) {
    console.error(" Expire payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   🧾 Lấy danh sách lớp đã HỦY thanh toán hoặc HẾT HẠN
========================================================= */
router.get("/payment/cancelled", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query;

    if (role === "tutor") {
      query = `
        SELECT class_id, subject, grade, tuition_amount, 
               weeks, sessions_per_week, student_id,
               payment_status, status, updated_at
        FROM classes
        WHERE tutor_id = (SELECT tutor_id FROM tutors WHERE user_id = ?)
        AND payment_status IN ('PAYMENT_CANCELLED', 'EXPIRED')
        ORDER BY updated_at DESC
      `;
    } else if (role === "student") {
      query = `
    SELECT 
      c.class_id, c.subject, c.grade, c.tuition_amount,
      c.payment_status, c.status, c.updated_at,
      u.full_name AS tutor_name, u.email AS tutor_email
    FROM classes c
    LEFT JOIN tutors t ON c.selected_tutor_id = t.tutor_id
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE c.student_id = ?
    AND c.payment_status IN ('PAYMENT_CANCELLED', 'EXPIRED', 'CANCELLED')
    ORDER BY c.updated_at DESC
  `;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });
    }

    const [rows] = await pool.query(query, [user_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get cancelled payments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ❌ Gia sư HỦY THANH TOÁN
router.put(
  "/:id/cancel-payment",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [tutor] = await pool.query(
        "SELECT tutor_id FROM tutors WHERE user_id=?",
        [req.user.user_id]
      );

      if (!tutor.length)
        return res
          .status(400)
          .json({ success: false, message: "Không tìm thấy gia sư." });

      await pool.query(
        "UPDATE classes SET payment_status='PAYMENT_CANCELLED', status='CANCELLED' WHERE class_id=? AND tutor_id=?",
        [id, tutor[0].tutor_id]
      );

      res.json({ success: true, message: " Hủy thanh toán thành công!" });
    } catch (err) {
      console.error("❌ Cancel payment error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =========================================================
   💳 4. GIA SƯ XÁC NHẬN THANH TOÁN (Stripe / VNPay / Demo)
========================================================= */
router.put(
  "/:id/confirm-payment",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const { id } = req.params;
      await conn.beginTransaction();

      // 🔍 Lấy trạng thái lớp
      const [classRows] = await conn.query(
        `SELECT student_id, selected_tutor_id, status, tuition_amount 
       FROM classes WHERE class_id=?`,
        [id]
      );
      if (!classRows.length) {
        await conn.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lớp học." });
      }

      const { student_id, selected_tutor_id, status, tuition_amount } =
        classRows[0];

      // 🧠 Xác định trạng thái kế tiếp
      let newStatus = "IN_PROGRESS"; // Học viên gửi lời mời
      if (status === "PENDING_PAYMENT") {
        // Gia sư gửi lời mời → thanh toán xong là DONE
        newStatus = "DONE";
      }

      // ✅ Cập nhật lớp học
      await conn.query(
        `UPDATE classes 
       SET payment_status='PAID', status=?, updated_at=NOW() 
       WHERE class_id=?`,
        [newStatus, id]
      );

      // ✅ Tạo bản ghi orders + payments (giả lập demo)
      await conn.query(
        `INSERT INTO orders (class_id, student_id, status, created_at)
       VALUES (?, ?, 'PAID', NOW())`,
        [id, student_id]
      );

      await conn.query(
        `INSERT INTO payments (order_id, payment_method, amount, status, transaction_code, created_at)
       SELECT o.order_id, 'STRIPE', ?, 'SUCCESS', CONCAT('PAY_', ?), NOW()
       FROM orders o WHERE o.class_id=? ORDER BY o.order_id DESC LIMIT 1`,
        [tuition_amount, id, id]
      );

      // 🔔 Thông báo cho học viên
      await conn.query(
        `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Gia sư đã thanh toán', ?, 'CLASS_UPDATE')`,
        [
          student_id,
          newStatus === "DONE"
            ? "Gia sư đã thanh toán và lớp được hoàn tất."
            : "Gia sư đã thanh toán, lớp bắt đầu được học.",
        ]
      );

      // 🔔 Thông báo cho gia sư
      const [tutorUser] = await conn.query(
        "SELECT user_id FROM tutors WHERE tutor_id=?",
        [selected_tutor_id]
      );
      if (tutorUser.length) {
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Thanh toán thành công', ?, 'CLASS_UPDATE')`,
          [
            tutorUser[0].user_id,
            newStatus === "DONE"
              ? "Bạn đã thanh toán và lớp đã được xác nhận hoàn tất."
              : "Bạn đã thanh toán thành công, lớp được kích hoạt.",
          ]
        );
      }

      await conn.commit();
      res.json({
        success: true,
        message:
          newStatus === "DONE"
            ? " Thanh toán thành công — Lớp đã hoàn tất."
            : " Thanh toán thành công — Lớp bắt đầu được học.",
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Confirm payment error:", err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      conn.release();
    }
  }
);

/* =========================================================
   📘 5. DANH SÁCH LỚP ĐANG DẠY / ĐANG HỌC (ĐÃ THANH TOÁN)
========================================================= */
router.get("/active", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query;

    if (role === "tutor") {
      query = `
        SELECT c.class_id, c.subject, c.grade, c.schedule, c.city, c.status,
               u.full_name AS student_name, u.email AS student_email
        FROM classes c
        JOIN users u ON u.user_id = c.student_id
        WHERE c.selected_tutor_id = (SELECT tutor_id FROM tutors WHERE user_id=?)
        AND c.payment_status='PAID'
        AND c.status='IN_PROGRESS'
        ORDER BY c.updated_at DESC`;
    } else if (role === "student") {
      query = `
        SELECT c.class_id, c.subject, c.grade, c.schedule, c.city, c.status,
               u.full_name AS tutor_name, u.email AS tutor_email
        FROM classes c
        JOIN tutors t ON c.selected_tutor_id=t.tutor_id
        JOIN users u ON u.user_id=t.user_id
        WHERE c.student_id=?
        AND c.payment_status='PAID'
        AND c.status='IN_PROGRESS'
        ORDER BY c.updated_at DESC`;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền." });
    }

    const [rows] = await pool.query(query, [user_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get active classes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   👨‍🏫 ALIAS: /tutor/active 
   ✅ LẤY DANH SÁCH LỚP ĐANG DẠY (CÓ Fallback start_date, end_date)
========================================================= */
router.get(
  "/tutor/active",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const { user_id } = req.user;

      console.log("✅ Fetching active classes for tutor:", user_id);

      const query = `
        SELECT 
          c.class_id, 
          c.subject, 
          c.grade, 
          c.schedule, 
          c.tuition_amount,
          c.city, 
          c.district,
          c.ward,
          c.address,
          c.status,
          c.payment_status,
          c.start_date,
          c.end_date,
          c.created_at,
          u.full_name AS student_name, 
          u.email AS student_email
        FROM classes c
        JOIN users u ON u.user_id = c.student_id
        WHERE c.selected_tutor_id = (SELECT tutor_id FROM tutors WHERE user_id=?)
          AND c.payment_status='PAID'
          AND c.status IN ('IN_PROGRESS', 'APPROVED_VISIBLE')
        ORDER BY c.start_date DESC
      `;

      const [rows] = await pool.query(query, [user_id]);

      // 🧩 Bổ sung fallback start_date & end_date nếu bị null
      const updatedRows = rows.map((cls) => {
        let start_date = cls.start_date || cls.created_at;
        let end_date = cls.end_date;

        try {
          const schedule =
            typeof cls.schedule === "string"
              ? JSON.parse(cls.schedule)
              : cls.schedule;

          // ✅ Nếu schedule hợp lệ và có weeks → tính end_date
          if (!end_date && schedule?.weeks) {
            const tmp = new Date(start_date);
            tmp.setDate(tmp.getDate() + schedule.weeks * 7);
            end_date = tmp;
          }
        } catch (err) {
          console.warn("⚠️ Lỗi parse schedule JSON:", err.message);
        }

        return {
          ...cls,
          start_date,
          end_date,
        };
      });

      console.log("✅ Found active classes:", updatedRows.length);

      res.json({ success: true, data: updatedRows });
    } catch (err) {
      console.error("❌ Get tutor active classes error:", err);
      res.status(500).json({
        success: false,
        message: err.sqlMessage || "Lỗi khi tải danh sách lớp đang dạy.",
      });
    }
  }
);

//

router.get("/payment/paid", verifyToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;
    let query;

    if (role === "tutor") {
      query = `
        SELECT class_id, subject, grade, tuition_amount, payment_status, status
        FROM classes
        WHERE tutor_id = (SELECT tutor_id FROM tutors WHERE user_id = ?)
        AND payment_status = 'PAID'
        ORDER BY updated_at DESC
      `;
    } else if (role === "student") {
      query = `
    SELECT 
      c.class_id, c.subject, c.grade, c.tuition_amount,
      c.payment_status, c.status, 
      u.full_name AS tutor_name, u.email AS tutor_email
    FROM classes c
    LEFT JOIN tutors t ON c.selected_tutor_id = t.tutor_id
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE c.student_id = ?
    AND c.payment_status = 'PAID'
    ORDER BY c.updated_at DESC
  `;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });
    }

    const [rows] = await pool.query(query, [user_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get paid classes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Lấy danh sách lớp đã kết thúc (cho tutor)
// ✅ Lấy danh sách lớp đã kết thúc (cho gia sư)
router.get(
  "/tutor/completed",
  verifyToken,
  requireRoles(["tutor"]),
  async (req, res) => {
    try {
      const tutorId = req.user.user_id;

      const [rows] = await pool.query(
        `
        SELECT 
          c.class_id,
          c.subject,
          c.grade,
          c.schedule,
          c.city,
          c.district,
          c.ward,
          c.address,
          c.tuition_amount,
          c.completed_at,
          u.full_name AS student_name,
          u.email AS student_email
        FROM classes c
        JOIN users u ON u.user_id = c.student_id
        WHERE c.selected_tutor_id = (
            SELECT tutor_id FROM tutors WHERE user_id = ?
        )
        AND c.status = 'DONE'
        ORDER BY c.completed_at DESC
        `,
        [tutorId]
      );

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get completed tutor classes error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =========================================================
   ✅ LẤY DANH SÁCH LỚP ĐANG HỌC (CHO HỌC VIÊN)
   - Fix: hiển thị cả lớp có status 'IN_PROGRESS' và 'APPROVED_VISIBLE'
   - Bổ sung fallback start_date, end_date tự tính từ schedule
========================================================= */
router.get(
  "/student/active",
  verifyToken,
  requireRoles(["student"]),
  async (req, res) => {
    try {
      const studentId = req.user.user_id;

      const [rows] = await pool.query(
        `
        SELECT 
          c.class_id,
          c.subject,
          c.grade,
          c.schedule,
          c.city,
          c.district,
          c.ward,
          c.address,
          c.payment_status,
          c.status,
          c.created_at,
          t.tutor_id,
          u.full_name AS tutor_name,
          u.email AS tutor_email,
          c.start_date,
          c.end_date
        FROM classes c
        JOIN tutors t ON c.selected_tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        WHERE c.student_id = ?
          AND c.payment_status = 'PAID'
          AND c.status IN ('IN_PROGRESS', 'APPROVED_VISIBLE')
        ORDER BY c.created_at DESC
        `,
        [studentId]
      );

      // 🧩 Bổ sung fallback start_date và end_date
      const updatedRows = rows.map((cls) => {
        let start_date = cls.start_date || cls.created_at;
        let end_date = cls.end_date;

        try {
          const schedule =
            typeof cls.schedule === "string"
              ? JSON.parse(cls.schedule)
              : cls.schedule;

          // ✅ Nếu schedule hợp lệ và có weeks → tự tính end_date
          if (!end_date && schedule?.weeks) {
            const tmp = new Date(start_date);
            tmp.setDate(tmp.getDate() + schedule.weeks * 7);
            end_date = tmp;
          }
        } catch (err) {
          console.warn("⚠️ Lỗi parse schedule JSON:", err.message);
        }

        return {
          ...cls,
          start_date,
          end_date,
        };
      });

      res.json({ success: true, data: updatedRows });
    } catch (err) {
      console.error("❌ Get active student classes error:", err);
      res.status(500).json({
        success: false,
        message: err.sqlMessage || err.message,
      });
    }
  }
);

// ✅ Lấy danh sách lớp đã kết thúc (cho học viên)
router.get(
  "/student/completed",
  verifyToken,
  requireRoles(["student"]),
  async (req, res) => {
    try {
      const studentId = req.user.user_id;

      const [rows] = await pool.query(
        `
        SELECT 
          c.class_id,
          c.subject,
          c.grade,
          c.schedule,
          c.city,
          c.district,
          c.ward,
          c.address,
          c.tuition_amount,
          c.completed_at,
          u.full_name AS tutor_name,
          u.email AS tutor_email
        FROM classes c
        JOIN tutors t ON c.selected_tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        WHERE c.student_id = ?
        AND c.status = 'DONE'
        ORDER BY c.completed_at DESC
        `,
        [studentId]
      );

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get completed student classes error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ✅ Xem chi tiết lớp đã kết thúc (cho học viên)
router.get(
  "/student/completed/:id",
  verifyToken,
  requireRoles(["student"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.user_id;

      const [rows] = await pool.query(
        `
        SELECT 
          c.class_id,
          c.subject,
          c.grade,
          c.schedule,
          c.city,
          c.district,
          c.ward,
          c.address,
          c.tuition_amount,
          c.completed_at,
          u.full_name AS tutor_name,
          u.email AS tutor_email
        FROM classes c
        JOIN tutors t ON c.selected_tutor_id = t.tutor_id
        JOIN users u ON u.user_id = t.user_id
        WHERE c.class_id = ?
          AND c.student_id = ?
          AND c.status = 'DONE'
        LIMIT 1
        `,
        [id, studentId]
      );

      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lớp học." });

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("❌ Get completed class detail error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// 🔍 Học viên tìm kiếm gia sư
router.get("/search/tutors", async (req, res) => {
  try {
    const { gender, age, education, city, district, ward } = req.query;

    let conditions = ["status = 'APPROVED'"];
    let params = [];

    if (gender && gender !== "Tất cả") {
      conditions.push("t.gender = ?");
      params.push(gender);
    }
    if (age && age !== "Tất cả") {
      conditions.push("TIMESTAMPDIFF(YEAR, t.birth_date, CURDATE()) = ?");
      params.push(age);
    }
    if (education && education !== "Tất cả") {
      conditions.push("t.education_level = ?");
      params.push(education);
    }
    if (city && city !== "Tất cả") {
      conditions.push("t.city LIKE ?");
      params.push(`%${city}%`);
    }
    if (district && district !== "Tất cả") {
      conditions.push("t.district LIKE ?");
      params.push(`%${district}%`);
    }
    if (ward && ward !== "Tất cả") {
      conditions.push("t.ward LIKE ?");
      params.push(`%${ward}%`);
    }

    const sql = `
      SELECT t.tutor_id, t.full_name, t.avatar, t.gender, t.education_level,
             t.major, t.university, t.experience, t.hourly_rate, t.city
      FROM tutors t
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.created_at DESC
    `;

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm gia sư:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tìm kiếm danh sách gia sư." });
  }
});

// 🔍 Gia sư tìm kiếm lớp học
router.get("/search/classes", async (req, res) => {
  try {
    const { gender, age_range, education, city, district, ward } = req.query;

    let conditions = ["status = 'APPROVED_VISIBLE'"];
    let params = [];

    if (gender && gender !== "Tất cả") {
      // Cho phép tìm lớp có yêu cầu cùng giới tính hoặc không yêu cầu
      conditions.push(
        "(teacher_gender = ? OR teacher_gender IS NULL OR teacher_gender = 'Không yêu cầu')"
      );
      params.push(gender);
    }
    if (age_range && age_range !== "Tất cả") {
      conditions.push("age_range = ?");
      params.push(age_range);
    }
    if (education && education !== "Tất cả") {
      conditions.push("education_level = ?");
      params.push(education);
    }
    if (city && city !== "Tất cả") {
      conditions.push("city LIKE ?");
      params.push(`%${city}%`);
    }
    if (district && district !== "Tất cả") {
      conditions.push("district LIKE ?");
      params.push(`%${district}%`);
    }
    if (ward && ward !== "Tất cả") {
      conditions.push("ward LIKE ?");
      params.push(`%${ward}%`);
    }

    const sql = `
      SELECT class_id, subject, grade, tuition_amount, city, district, ward,
             teacher_gender, age_range, education_level, experience, description
      FROM classes
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm lớp:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tìm kiếm danh sách lớp học." });
  }
});

export default router;
