"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuthUser, logout } from "../utils/auth";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  if (!user) return null; // chưa login thì không hiển thị

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const goDashboard = () => {
    if (user.role === "admin") router.push("/dashboard/admin");
    else if (user.role === "tutor") router.push("/dashboard/tutor");
    else if (user.role === "accountant") router.push("/dashboard/accountant");
    else if (user.role === "cskh") router.push("/dashboard/cskh");
    else router.push("/dashboard/student");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "#f5f5f5",
      }}
    >
      <div style={{ cursor: "pointer" }} onClick={goDashboard}>
        <strong>📚 DayThem App</strong>
      </div>
      <div>
        <span style={{ marginRight: 15 }}>
          👤 {user.full_name} ({user.role})
        </span>
        <button onClick={goDashboard} style={{ marginRight: 10 }}>
          Dashboard
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
