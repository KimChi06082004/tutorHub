import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { verifyToken, requireRoles } from "../middlewares/auth.js";

const router = express.Router();

/* =========================================================
   🧭 GET /api/users?search=...&page=1&limit=10
   Admin xem danh sách user, có tìm kiếm + phân trang
========================================================= */
router.get("/", verifyToken, requireRoles(["admin"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const where = search ? `WHERE full_name LIKE ? OR email LIKE ?` : "";

    const params = search
      ? [`%${search}%`, `%${search}%`, limit, offset]
      : [limit, offset];

    const [rows] = await pool.query(
      `
      SELECT 
        user_id, full_name, email, role, status, referral_code, created_at
      FROM users
      ${where}
      ORDER BY user_id ASC
      LIMIT ? OFFSET ?
      `,
      params
    );

    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total 
      FROM users
      ${search ? "WHERE full_name LIKE ? OR email LIKE ?" : ""}
      `,
      search ? [`%${search}%`, `%${search}%`] : []
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (err) {
    console.error("❌ Users list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   🧩 GET /api/users/:id
   Admin hoặc chính chủ xem chi tiết tài khoản
========================================================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.user_id != req.params.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role, status, referral_code, created_at FROM users WHERE user_id=?",
      [req.params.id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ User detail error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   🧩 PUT /api/users/:id
   Admin hoặc chính chủ update thông tin cá nhân
========================================================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.user_id != req.params.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { full_name, password } = req.body;
    const fields = [];
    const params = [];

    if (full_name) {
      fields.push("full_name=?");
      params.push(full_name);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("password=?");
      params.push(hashed);
    }

    if (!fields.length) {
      return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }

    params.push(req.params.id);
    await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE user_id=?`,
      params
    );

    res.json({ success: true, message: "✅ User updated successfully" });
  } catch (err) {
    console.error("❌ User update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   🧑‍💼 PATCH /api/users/:id/role
   Admin đổi vai trò user
========================================================= */
router.patch(
  "/:id/role",
  verifyToken,
  requireRoles(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      const validRoles = ["admin", "student", "tutor", "accountant", "cskh"];

      if (!validRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }

      await pool.query("UPDATE users SET role=? WHERE user_id=?", [
        role,
        req.params.id,
      ]);

      res.json({ success: true, message: "✅ Role updated successfully" });
    } catch (err) {
      console.error("❌ Role update error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   🔒 PATCH /api/users/:id/status
   Admin khóa / mở khóa tài khoản
========================================================= */
router.patch(
  "/:id/status",
  verifyToken,
  requireRoles(["admin"]),
  async (req, res) => {
    try {
      const { status } = req.body; // ACTIVE / BANNED
      if (!["ACTIVE", "BANNED"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      await pool.query("UPDATE users SET status=? WHERE user_id=?", [
        status,
        req.params.id,
      ]);

      res.json({
        success: true,
        message:
          status === "ACTIVE"
            ? "🔓 User unlocked successfully"
            : "🔒 User has been banned",
      });
    } catch (err) {
      console.error("❌ Status update error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =========================================================
   🗑️ DELETE /api/users/:id
   Admin xóa tài khoản
========================================================= */
router.delete(
  "/:id",
  verifyToken,
  requireRoles(["admin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM users WHERE user_id=?", [req.params.id]);
      res.json({ success: true, message: "🗑️ User deleted successfully" });
    } catch (err) {
      console.error("❌ Delete user error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
