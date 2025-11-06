import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import { setAuthUser } from "../utils/auth";
import Link from "next/link";

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
        const access = accessToken || token;

        if (access) localStorage.setItem("accessToken", access);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        setAuthUser(user, access);
        setMessage(" Đăng nhập thành công!");
        setSuccess(true);
        setForm({ email: "", password: "" });

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
        setMessage(res.data.message || " Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error(" Login error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || " Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#003366] flex items-center justify-center gap-2">
          Đăng nhập hệ thống
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg font-semibold text-white text-lg shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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

        {/* ✅ Nút Quên mật khẩu */}
        <p className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Quên mật khẩu?
          </Link>
        </p>

        {/* Đăng ký */}
        <p className="text-center mt-3 text-gray-600 text-sm">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
