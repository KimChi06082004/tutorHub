import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link"; // ✅ dùng Link để tránh cảnh báo ESLint

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      });

      setMessage(res.data.message || "✅ Đặt lại mật khẩu thành công!");

      // Quay lại login sau 2s
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message ||
          "❌ Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại OTP!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#003366] flex items-center justify-center gap-2">
          🔐 Đặt lại mật khẩu
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-gray-600 font-medium">
            Email đăng ký
          </label>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none p-3 rounded-lg mb-4 w-full transition"
            required
          />

          <label className="block mb-2 text-gray-600 font-medium">Mã OTP</label>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none p-3 rounded-lg mb-4 w-full transition"
            required
          />

          <label className="block mb-2 text-gray-600 font-medium">
            Mật khẩu mới
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none p-3 rounded-lg mb-6 w-full transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-green-600 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 text-red-600 text-center font-medium">{error}</p>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Gửi lại OTP
          </Link>
          {"  |  "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
