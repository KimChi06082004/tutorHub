import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../config/db.js";
import { verifyToken, requireRoles } from "../middlewares/auth.js";
dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 💳 API tạo session thanh toán Stripe
router.post("/stripe", async (req, res) => {
  try {
    const { class_id, amount, subject } = req.body;

    // ✅ amount bạn đang gửi từ frontend là VNĐ
    // Stripe chỉ hỗ trợ USD, nên ta đổi sang USD để thanh toán, nhưng vẫn lưu VNĐ ở DB
    const amountInUSD = amount / 24000; // chuyển sang USD để thanh toán
    const stripeAmount = Math.round(amountInUSD * 100); // USD → cents

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    console.log("🔍 Thanh toán:", {
      VNĐ: amount,
      USD: amountInUSD,
      stripeAmount,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Đặt cọc lớp ${class_id} - ${subject}` },
            unit_amount: stripeAmount, // ✅ Stripe dùng cents của USD
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendURL}/tutor/payments/success?class_id=${class_id}`,
      cancel_url: `${frontendURL}/tutor/payments/cancelled`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   📊 LẤY DANH SÁCH TOÀN BỘ GIAO DỊCH THANH TOÁN (Admin)
========================================================= */
router.get("/all", verifyToken, requireRoles(["admin"]), async (req, res) => {
  try {
    const { month, year } = req.query;

    let sql = `
      SELECT 
        payment_id,
        order_id,
        payment_method,
        amount,
        status,
        transaction_code,
        created_at
      FROM payments
      WHERE status = 'SUCCESS'
    `;
    const params = [];

    if (year) {
      sql += " AND YEAR(created_at) = ?";
      params.push(year);
    }
    if (month) {
      sql += " AND MONTH(created_at) = ?";
      params.push(month);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get payments error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách giao dịch.",
    });
  }
});

export default router;
