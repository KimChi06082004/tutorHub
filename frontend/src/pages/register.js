import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import { setAuthUser } from "../utils/auth";
import Link from "next/link";

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

        // Redirect theo role
        if (user.role === "admin") router.push("/dashboard/admin");
        else if (user.role === "tutor") router.push("/dashboard/tutor");
        else if (user.role === "accountant")
          router.push("/dashboard/accountant");
        else router.push("/dashboard/student");
      } else {
        alert(res.data.message || "Register failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Register failed, please try again!");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>📝 Đăng ký tài khoản</h2>
        <p className="subtitle">
          Tham gia ngay để bắt đầu hành trình học tập của bạn!
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Họ và tên"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
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
            Đăng ký
          </button>
        </form>

        <p className="login-link">
          Đã có tài khoản? <Link href="/login/">Đăng nhập</Link>
        </p>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: "Inter", sans-serif;
        }

        .register-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          padding: 40px 30px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        h2 {
          color: #1e293b;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input,
        select {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: border 0.2s, box-shadow 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }

        .btn-register {
          margin-top: 8px;
          background: linear-gradient(90deg, #4f46e5, #06b6d4);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-register:hover {
          opacity: 0.9;
          transform: translateY(-1px);
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
          .register-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}
