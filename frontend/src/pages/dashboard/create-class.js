// frontend/src/pages/dashboard/create-class.js
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Footer from "../../components/Footer";

export default function CreateClass() {
  const router = useRouter();
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    schedule: "",
    tuition_amount: "",
    visibility: "PUBLIC",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/classes", form);
      if (res.data.success) {
        setMessage("✅ Lớp đã tạo thành công, chờ admin duyệt!");
        setTimeout(() => router.push("/dashboard/student"), 1500);
      } else {
        setMessage("❌ Không thể tạo lớp, vui lòng thử lại!");
      }
    } catch (err) {
      console.error("❌ Create class error:", err);
      if (err.response?.status === 401) {
        setMessage("⚠️ Bạn cần đăng nhập bằng tài khoản student!");
      } else {
        setMessage("❌ Lỗi tạo lớp, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sidebar + Topbar */}
      <Sidebar />
      <Topbar />

      {/* Nội dung */}
      <div className="main-content">
        <h2 style={{ marginBottom: 20 }}>📘 Đăng tuyển lớp mới</h2>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: 25,
            borderRadius: 8,
            maxWidth: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: 15 }}>
            <label>Môn học:</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label>Lớp/Khối:</label>
            <input
              type="text"
              name="grade"
              value={form.grade}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label>Lịch học:</label>
            <input
              type="text"
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              placeholder="VD: Thứ 2, 4, 6 - 18h-20h"
              required
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label>Học phí (VND/giờ):</label>
            <input
              type="number"
              name="tuition_amount"
              value={form.tuition_amount}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label>Khu vực / Thành phố:</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="VD: Hồ Chí Minh"
              style={{ width: "100%", padding: 8, marginTop: 5 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#0d6efd",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "⏳ Đang xử lý..." : "📤 Đăng lớp"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 20, fontWeight: "500", color: "#d9534f" }}>
            {message}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
