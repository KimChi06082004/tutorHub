import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import emailjs from "@emailjs/nodejs";
import { pool } from "../config/db.js";

const router = express.Router();

/* =========================================================
   POST /api/auth/register
========================================================= */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    const [dup] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    if (dup.length)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const referralCode =
      "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const [rs] = await pool.query(
      "INSERT INTO users (full_name, email, password, role, referral_code) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashed, role || "student", referralCode]
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: { user_id: rs.insertId, full_name, email, role: role || "student" },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   POST /api/auth/login
========================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows.length)
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });

    // ✅ Token có đầy đủ thông tin user để middleware nhận diện
    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES || "14d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token: accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   POST /api/auth/send-otp  →  gửi mã OTP qua emailjs
========================================================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Thiếu email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // 🧠 Lưu OTP vào bảng password_reset_otps
    try {
      await pool.query(
        "INSERT INTO password_reset_otps (email, otp_code, expires_at) VALUES (?, ?, ?)",
        [email, otp, expiresAt]
      );
      console.log(" OTP saved to database:", otp);
    } catch (dbErr) {
      console.error(" Database error:", dbErr.message);
      return res.status(500).json({
        success: false,
        message:
          "Lỗi database. Có thể bảng password_reset_otps chưa được tạo. Hãy chạy: mysql -u root websitedaythem < backend/create-otp-table.sql",
      });
    }

    // ✉️ Gửi qua EmailJS
    console.log("Sending OTP via EmailJS to:", email);
    console.log("Service ID:", process.env.EMAILJS_SERVICE_ID);
    console.log("Template ID:", process.env.EMAILJS_TEMPLATE_ID);
    console.log(
      "Public Key:",
      process.env.EMAILJS_PUBLIC_KEY ? "Set" : "Missing"
    );

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_name: email.split("@")[0],
          to_email: email,
          otp: otp,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
        }
      );
      console.log(" Email sent successfully!");
    } catch (emailErr) {
      console.error(" EmailJS error:", emailErr.message);
      console.log(
        " Email failed but OTP is saved. Use this OTP for testing:",
        otp
      );
      // Vẫn trả về thành công vì OTP đã được lưu
      return res.json({
        success: true,
        message:
          " OTP đã được tạo (Email failed nhưng bạn có thể dùng OTP này để test): " +
          otp,
        otp: otp, // Chỉ để test, xóa sau khi production
      });
    }

    res.json({ success: true, message: " OTP đã gửi về email của bạn!" });
  } catch (err) {
    console.error(" Send OTP error:", err);
    console.error("Error details:", err.message);
    console.error("Error stack:", err.stack);
    res
      .status(500)
      .json({ success: false, message: "Không thể gửi OTP: " + err.message });
  }
});

/* =========================================================
   POST /api/auth/verify-otp  →  xác minh OTP hợp lệ
========================================================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Thiếu email hoặc mã OTP" });

    const [rows] = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email]
    );
    if (!rows.length)
      return res.status(400).json({ message: "Không tìm thấy OTP" });

    const record = rows[0];
    if (record.otp_code !== otp)
      return res.status(400).json({ message: "Sai mã OTP" });
    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });

    res.json({ success: true, message: " OTP hợp lệ" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Lỗi xác minh OTP" });
  }
});

/* =========================================================
   POST /api/auth/reset-password  →  đổi mật khẩu mới
========================================================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const [rows] = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email]
    );
    if (!rows.length)
      return res.status(400).json({ message: "Không tìm thấy OTP" });

    const record = rows[0];
    if (record.otp_code !== otp)
      return res.status(400).json({ message: "Sai mã OTP" });
    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn" });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashed,
      email,
    ]);

    // Xóa OTP sau khi dùng
    await pool.query("DELETE FROM password_reset_otps WHERE email = ?", [
      email,
    ]);

    res.json({ success: true, message: " Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Không thể đặt lại mật khẩu" });
  }
});

export default router;
