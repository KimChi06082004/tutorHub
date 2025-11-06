import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import { setAuthUser } from "../utils/auth";
import Link from "next/link";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/register", form);
      if (res.data.success) {
        const { user, token } = res.data;
        setAuthUser(user, token);

        if (user.role === "admin") router.push("/dashboard/admin");
        else if (user.role === "tutor") router.push("/dashboard/tutor");
        else if (user.role === "accountant")
          router.push("/dashboard/accountant");
        else router.push("/dashboard/student");
      } else {
        setMessage(res.data.message || " Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Register error:", err);
      setMessage(" Lỗi kết nối máy chủ, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      {/* Logo thương hiệu */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/logo-daythem.png"
          alt="DạyThêm Logo"
          width={160}
          height={160}
          className="animate-fade-in"
        />
      </div>

      {/* Thẻ form */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02] animate-fade-up">
        <h2 className="text-3xl font-bold text-center text-[#003366] mb-2">
          ✨ Đăng ký tài khoản
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Tham gia để bắt đầu hành trình học tập và chia sẻ tri thức!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="👤 Họ và tên"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            required
          />

          <input
            type="email"
            placeholder="📧 Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            required
          />

          <input
            type="password"
            placeholder="🔒 Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            required
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            <option value="student"> Học viên</option>
            <option value="tutor"> Gia sư</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg text-white font-semibold text-lg shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            }`}
          >
            {loading ? "⏳ Đang đăng ký..." : " Đăng ký ngay"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("❌") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center mt-5 text-gray-600 text-sm">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.8s ease;
        }
        .animate-fade-in {
          animation: fadeUp 1s ease;
        }
      `}</style>
    </div>
  );
}
