"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đăng ký");

      alert("Đăng ký thành công!");
      router.push("/login"); // 👉 Chuyển sang login sau khi đăng ký
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-3 w-80 bg-gray-900 p-6 rounded"
      >
        <h2 className="text-xl font-bold mb-4">Đăng ký tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="p-2 border rounded text-black"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded text-black"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded text-black"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border rounded text-black"
        >
          <option value="student">Học viên</option>
          <option value="tutor">Gia sư</option>
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Đăng ký
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
