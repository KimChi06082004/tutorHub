import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TopbarAdmin() {
  const [adminName, setAdminName] = useState("Admin");
  const [adminRole, setAdminRole] = useState("Quản trị viên");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (typeof window === "undefined") return;

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setAdminName(data.data.full_name || "Admin");
            setAdminRole(data.data.role || "Quản trị viên");
          }
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  // ✅ Điều hướng khi click menu
  const goTo = (tab) => {
    router.push(`/dashboard/admin?tab=${tab}`);
  };

  return (
    <header className="w-full bg-white shadow-sm p-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-200">
      {/* Tiêu đề chính */}
      <div
        className="text-xl font-bold text-[#003366] cursor-pointer"
        onClick={() => router.push("/dashboard/admin")}
      >
        🛠️ Bảng điều khiển Admin
      </div>

      {/* Thanh menu quản lý */}
      <nav className="flex items-center gap-4 mt-3 md:mt-0">
        <button
          onClick={() => goTo("users")}
          className="text-sm px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
        >
          🧑‍💼 Quản lý người dùng
        </button>
        <button
          onClick={() => goTo("classes")}
          className="text-sm px-4 py-2 rounded-md bg-green-50 hover:bg-green-100 text-green-700 font-medium transition"
        >
          📚 Quản lý lớp học
        </button>
        <button
          onClick={() => goTo("tutors")}
          className="text-sm px-4 py-2 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition"
        >
          🎓 Quản lý gia sư
        </button>
      </nav>

      {/* Góc phải: thông tin admin */}
      <div className="flex items-center gap-4 mt-3 md:mt-0">
        {loading ? (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
            <div className="text-sm text-gray-500">Đang tải...</div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">
                {adminName}
              </span>
              <span className="text-xs text-gray-500">{adminRole}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition-colors duration-200"
            >
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  );
}
