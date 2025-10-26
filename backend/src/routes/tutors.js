import express from "express";
import { pool } from "../config/db.js";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

/* ============================================================
   ⚙️ 1. ADMIN – Danh sách hồ sơ chờ duyệt
============================================================ */
router.get(
  "/pending",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT tutor_id, full_name, university, major, avatar, status, created_at
        FROM tutors
        WHERE status='PENDING'
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get pending tutors error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ============================================================
   ⚙️ 2. ADMIN – Danh sách hồ sơ đã duyệt
============================================================ */
router.get(
  "/approved",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT tutor_id, full_name, university, major, avatar, approved_at
        FROM tutors
        WHERE status='APPROVED'
        ORDER BY approved_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get approved tutors error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ============================================================
   ⚙️ 3. ADMIN – Danh sách hồ sơ bị từ chối
============================================================ */
router.get(
  "/rejected",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT tutor_id, full_name, university, major, reject_reason, rejected_at
        FROM tutors
        WHERE status='REJECTED'
        ORDER BY rejected_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get rejected tutors error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ============================================================
   ⚙️ 4. ADMIN – Lịch sử duyệt (APPROVED + REJECTED)
============================================================ */
router.get(
  "/history",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT tutor_id, full_name, university, major, status,
               approved_at, rejected_at, reject_reason, updated_at
        FROM tutors
        WHERE status IN ('APPROVED', 'REJECTED')
        ORDER BY updated_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get tutor history error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ============================================================
   ⚙️ 5. HỌC VIÊN – Lấy danh sách gia sư (APPROVED)
============================================================ */
router.get("/", async (req, res) => {
  try {
    const {
      subject,
      city,
      priceMin,
      priceMax,
      status = "APPROVED",
      page = 1,
    } = req.query;

    let sql = `
      SELECT tutor_id, full_name, avatar, city, subject, hourly_rate, lat, lng
      FROM tutors WHERE 1=1
    `;
    const params = [];

    if (subject) {
      sql += " AND subject LIKE ?";
      params.push(`%${subject}%`);
    }
    if (city) {
      sql += " AND city LIKE ?";
      params.push(`%${city}%`);
    }
    if (priceMin) {
      sql += " AND hourly_rate >= ?";
      params.push(priceMin);
    }
    if (priceMax) {
      sql += " AND hourly_rate <= ?";
      params.push(priceMax);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY tutor_id DESC LIMIT 10 OFFSET ?";
    params.push((page - 1) * 10);

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Tutors list error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================================
   ⚙️ 6. GIA SƯ – Lấy danh sách học viên (có tọa độ)
============================================================ */
router.get("/students", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT student_id, full_name, avatar, city, lat, lng
      FROM students
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      ORDER BY student_id DESC
      LIMIT 50
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Students list error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================================
   ⚙️ 7. GỬI CV – Gia sư tạo hồ sơ chờ duyệt
============================================================ */
router.post("/submit-cv", verifyToken, async (req, res) => {
  try {
    const {
      full_name,
      birth_date,
      gender,
      avatar,
      cccd_front,
      cccd_back,
      certificates,
      bio,
      education_level,
      major,
      university,
      experience,
      hourly_rate,
      city,
      subject,
      degree_url,
      lat,
      lng,
    } = req.body;

    if (!full_name || !avatar) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Vui lòng điền đầy đủ thông tin!",
      });
    }

    const user_id = req.user?.user_id || req.user?.id;

    const [exists] = await pool.query(
      "SELECT tutor_id FROM tutors WHERE user_id=?",
      [user_id]
    );

    if (exists.length) {
      // ✅ Cập nhật hồ sơ cũ
      await pool.query(
        `UPDATE tutors SET 
    full_name=?, birth_date=?, gender=?, avatar=?, cccd_front=?, cccd_back=?, 
    certificates=?, bio=?, education_level=?, major=?, university=?, 
    experience=?, hourly_rate=?, city=?, subject=?, degree_url=?, lat=?, lng=?,
    status='PENDING', updated_at=NOW()
  WHERE user_id=?`,
        [
          full_name,
          birth_date,
          gender || null,
          avatar,
          cccd_front,
          cccd_back,
          JSON.stringify(certificates || []),
          bio,
          education_level,
          major,
          university,
          experience,
          hourly_rate || null,
          city || null,
          subject || null,
          degree_url || null,
          lat || null,
          lng || null,
          user_id,
        ]
      );
    } else {
      // 🆕 Thêm hồ sơ mới (đã fix)
      await pool.query(
        `INSERT INTO tutors (
    user_id, full_name, birth_date, gender, avatar, cccd_front, cccd_back, certificates, bio,
    education_level, major, university, experience, hourly_rate, city, subject, degree_url,
    lat, lng, status, created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
        [
          user_id,
          full_name,
          birth_date,
          gender || null,
          avatar,
          cccd_front,
          cccd_back,
          JSON.stringify(certificates || []),
          bio,
          education_level,
          major,
          university,
          experience,
          hourly_rate || null,
          city || null,
          subject || null,
          degree_url || null,
          lat || null,
          lng || null,
        ]
      );
    }

    res.json({
      success: true,
      message: "✅ Hồ sơ đã được gửi – vui lòng chờ admin duyệt!",
    });
  } catch (err) {
    console.error("❌ Submit CV error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================================================
   ⚙️ 8. ADMIN – Duyệt hoặc từ chối hồ sơ
============================================================ */

// ✅ DUYỆT hồ sơ
router.put(
  "/:id/approve",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const tutorId = req.params.id;
      const adminId = req.user.user_id;

      const [check] = await pool.query(
        "SELECT * FROM tutors WHERE tutor_id=?",
        [tutorId]
      );
      if (!check.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy hồ sơ gia sư." });

      await pool.query(
        `UPDATE tutors SET 
          status='APPROVED',
          approved_at=NOW(),
          approved_by=?,
          reject_reason=NULL,
          rejected_at=NULL,
          updated_at=NOW()
        WHERE tutor_id=?`,
        [adminId, tutorId]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Hồ sơ được duyệt', '🎉 Chúc mừng! Hồ sơ của bạn đã được admin phê duyệt.', 'TUTOR_APPROVAL')`,
        [check[0].user_id]
      );

      res.json({ success: true, message: "✅ Hồ sơ gia sư đã được duyệt." });
    } catch (err) {
      console.error("❌ Approve tutor error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ❌ TỪ CHỐI hồ sơ
router.put(
  "/:id/reject",
  verifyToken,
  requireRole(["admin", "cskh"]),
  async (req, res) => {
    try {
      const tutorId = req.params.id;
      const adminId = req.user.user_id;
      const reason = req.body?.reason || "Hồ sơ không đạt yêu cầu.";

      const [check] = await pool.query(
        "SELECT * FROM tutors WHERE tutor_id=?",
        [tutorId]
      );
      if (!check.length)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy hồ sơ gia sư." });

      await pool.query(
        `UPDATE tutors SET 
          status='REJECTED',
          reject_reason=?,
          rejected_at=NOW(),
          approved_by=?,
          updated_at=NOW()
        WHERE tutor_id=?`,
        [reason, adminId, tutorId]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Hồ sơ bị từ chối', ?, 'TUTOR_REJECT')`,
        [check[0].user_id, reason]
      );

      res.json({ success: true, message: "❌ Hồ sơ gia sư đã bị từ chối." });
    } catch (err) {
      console.error("❌ Reject tutor error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ============================================================
   ⚙️ 9. Lấy chi tiết hồ sơ gia sư (đặt cuối cùng để tránh xung đột route)
============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tutors WHERE tutor_id=?", [
      req.params.id,
    ]);

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });

    const tutor = rows[0];

    // ✅ Parse JSON của certificates
    if (tutor.certificates && typeof tutor.certificates === "string") {
      try {
        tutor.certificates = JSON.parse(tutor.certificates);
      } catch {
        tutor.certificates = [];
      }
    }
    if (!Array.isArray(tutor.certificates)) tutor.certificates = [];

    res.json({ success: true, data: tutor });
  } catch (err) {
    console.error("❌ Get tutor detail error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
