// frontend/src/pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import { setAuthUser } from "../utils/auth";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.success) {
        const { user, accessToken, refreshToken, token } = res.data;

        // ✅ Ưu tiên accessToken, fallback token cũ nếu chưa cập nhật backend
        const access = accessToken || token;
        if (access) localStorage.setItem("accessToken", access);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        // ✅ Lưu thông tin người dùng (tên, vai trò, email)
        setAuthUser(user, access);

        setMessage("✅ Đăng nhập thành công!");
        setSuccess(true);

        // Reset form
        setForm({ email: "", password: "" });

        // ✅ Chuyển hướng dựa vào vai trò
        setTimeout(() => {
          switch (user.role) {
            case "admin":
              router.replace("/dashboard/admin");
              break;
            case "tutor":
              router.replace("/dashboard/tutor");
              break;
            case "accountant":
              router.replace("/dashboard/accountant");
              break;
            default:
              router.replace("/dashboard/student");
              break;
          }
        }, 1000);
      } else {
        setMessage(res.data.message || "❌ Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "❌ Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4 text-[#003366]">
          🔐 Đăng nhập hệ thống
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-lg font-semibold text-white transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "⏳ Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center mt-4 text-gray-600">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
