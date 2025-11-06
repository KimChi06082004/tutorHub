import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TopbarAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentTab = params.get("tab") || "users";
    setActiveTab(currentTab);
  }, [router.query]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`);
  };

  const handleLogout = () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Logo bên trái */}
      <div
        className="font-bold text-[#003366] text-lg cursor-pointer flex items-center gap-2"
        onClick={() => router.push("/dashboard/admin")}
      >
        ⚙️ <span className="hidden sm:inline">Bảng điều khiển Admin</span>
      </div>

      {/* Menu giữa */}
      <div className="flex gap-3">
        <button
          onClick={() => handleTabChange("users")}
          className={`px-5 py-2 rounded-md font-medium transition-all ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quản lý người dùng
        </button>

        <button
          onClick={() => handleTabChange("classes")}
          className={`px-5 py-2 rounded-md font-medium transition-all ${
            activeTab === "classes"
              ? "bg-green-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quản lý lớp học
        </button>

        <button
          onClick={() => handleTabChange("tutors")}
          className={`px-5 py-2 rounded-md font-medium transition-all ${
            activeTab === "tutors"
              ? "bg-amber-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quản lý hồ sơ gia sư
        </button>

        <button
          onClick={() => handleTabChange("revenue")}
          className={`px-5 py-2 rounded-md font-medium transition-all ${
            activeTab === "revenue"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quản lý doanh thu
        </button>
      </div>

      {/* Nút đăng xuất bên phải */}
      <div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
