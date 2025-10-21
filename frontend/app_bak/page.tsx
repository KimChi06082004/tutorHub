"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error("Fetch me error:", err));
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      {user ? (
        <h1 className="text-2xl">Xin chào {user.full_name} 👋</h1>
      ) : (
        <h1 className="text-xl">Bạn chưa đăng nhập</h1>
      )}
    </div>
  );
}
