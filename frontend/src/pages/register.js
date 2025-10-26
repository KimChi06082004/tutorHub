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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(res.data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Lỗi kết nối máy chủ, vui lòng thử lại!");
    }
  };

  return (
    <div className="register-page">
      <Image
        src="/logo-daythem.png"
        alt="DạyThêm.com Logo"
        width={300}
        height={300}
        className="logo"
      />
      <div className="form-card">
        <h2>ĐĂNG KÝ TÀI KHOẢN </h2>
        <p className="subtitle">
          Tham gia để bắt đầu hành trình học tập và chia sẻ tri thức!
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="👤 Họ và tên"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="📧 Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="🔒 Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">🎓 Học viên</option>
            <option value="tutor">👨‍🏫 Gia sư</option>
          </select>

          <button type="submit" className="btn-register">
            🚀 Đăng ký ngay
          </button>
        </form>

        <p className="login-link">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </p>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center; /* canh giữa theo chiều dọc */
          align-items: center; /* canh giữa theo chiều ngang */
          background: #f9fafb;
          font-family: "Inter", sans-serif;
          padding: 0; /* loại bỏ padding thừa */
          margin: 0;
        }

        .brand {
          text-align: center;
          margin-bottom: 8px; /* khoảng cách nhỏ giữa logo và form */
        }

        .logo {
          width: 240px; /* logo to hơn, đẹp hơn */
          height: auto;
          margin-bottom: 4px; /* gần slogan hơn */
        }

        .form-card {
          margin-top: -100px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 35px 30px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          animation: fadeInUp 0.8s ease;
        }

        .brand h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
        }

        .highlight {
          color: #4f46e5;
        }

        .tagline {
          font-size: 14px;
          color: #64748b;
          margin-top: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        h2 {
          color: #1e293b;
          margin-bottom: 10px;
        }

        .subtitle {
          color: #64748b;
          font-size: 15px;
          margin-bottom: 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        input,
        select {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          background: #f8fafc;
          transition: 0.25s;
        }

        input:focus,
        select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: #fff;
        }

        .btn-register {
          background: linear-gradient(90deg, #4f46e5, #06b6d4);
          color: #fff;
          font-weight: 600;
          padding: 12px;
          border-radius: 10px;
          border: none;
          margin-top: 10px;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-register:hover {
          opacity: 0.95;
          transform: scale(1.03);
        }

        .login-link {
          margin-top: 16px;
          font-size: 14px;
          color: #475569;
        }

        .login-link a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 30px 20px;
          }
          .brand h1 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
