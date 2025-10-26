// src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import tutorRoutes from "./routes/tutors.js";
import classRoutes from "./routes/classes.js";
import sessionRoutes from "./routes/sessions.js";
import attendanceRoutes from "./routes/attendance.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import payoutRoutes from "./routes/payouts.js";
import complaintRoutes from "./routes/complaints.js";
import notificationRoutes from "./routes/notifications.js";
import ratingRoutes from "./routes/ratings.js";
import uploadRoutes from "./routes/upload.js";
import requestRoutes from "./routes/requests.js";
import tutorSelectedRouter from "./routes/tutorSelected.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Tạo thư mục uploads nếu chưa có
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

app.use("/api/tutors", tutorRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tutor/selected-classes", tutorSelectedRouter);
// ✅ Static file (ảnh upload)
app.use("/uploads", express.static("uploads"));

// ✅ Route mặc định
app.get("/", (req, res) => {
  res.send("🚀 Website Dạy Thêm API is running...");
});

// ✅ Middleware xử lý lỗi chung
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ✅ Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
