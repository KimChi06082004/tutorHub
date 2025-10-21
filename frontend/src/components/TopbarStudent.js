import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { logout, getAuthUser } from "../utils/auth";
import Link from "next/link";

export default function TopbarStudent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = getAuthUser();
      setUser(u);
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#003366] text-white shadow-md z-50">
      <div className="flex items-center justify-between px-8 py-3">
        {/* --- Logo + Menu --- */}
        <div className="flex items-center space-x-8">
          {/* LOGO */}
          <div
            className="flex items-center cursor-pointer select-none ml-2"
            onClick={() => router.push("/")}
          >
            <img
              src="/logo-daythem.png"
              alt="DayThem Logo"
              className="w-15 h-14 object-contain ml-2 mr-5 rounded-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-extrabold text-[#ff7b00] tracking-wider">
                DAYTHEM
              </span>
              <span className="text-[12px] text-yellow-200 italic -mt-1">
                Đồng hành cùng bạn, bứt phá giới hạn
              </span>
            </div>
          </div>

          {/* MENU BUTTONS */}
          <div className="flex items-center space-x-3 ml-6">
            {/* 📑 Quản lý tuyển chọn */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("select")}
                className="border border-[#6699cc] bg-transparent px-4 py-2 rounded-md hover:bg-[#004080] transition"
              >
                📄 Quản lý tuyển chọn ▾
              </button>
              {openMenu === "select" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/classes/posted"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    📘 Lớp đã đăng
                  </Link>
                  <Link
                    href="/student/classes/applicants"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    👩‍🏫 Gia sư ứng tuyển
                  </Link>
                </div>
              )}
            </div>

            {/* 💰 Quản lý học phí */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("payment")}
                className="border border-[#6699cc] bg-transparent px-4 py-2 rounded-md hover:bg-[#004080] transition"
              >
                💰 Quản lý học phí ▾
              </button>
              {openMenu === "payment" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/payments/pending"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    💸 Cần thanh toán
                  </Link>
                  <Link
                    href="/student/payments/paid"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    ✅ Đã thanh toán
                  </Link>
                  <Link
                    href="/student/payments/cancelled"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    ❌ Hủy thanh toán
                  </Link>
                </div>
              )}
            </div>

            {/* 📘 Quản lý lớp học */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("class")}
                className="border border-[#6699cc] bg-transparent px-4 py-2 rounded-md hover:bg-[#004080] transition"
              >
                📚 Quản lý lớp học ▾
              </button>
              {openMenu === "class" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/schedule/ongoing"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    📅 Lịch đang học
                  </Link>
                  <Link
                    href="/student/schedule/completed"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    🏁 Lớp kết thúc
                  </Link>
                </div>
              )}
            </div>

            {/* 📂 Quản lý thư mục */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("folder")}
                className="border border-[#6699cc] bg-transparent px-4 py-2 rounded-md hover:bg-[#004080] transition"
              >
                📁 Quản lý thư mục ▾
              </button>
              {openMenu === "folder" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/files/homework"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    📄 Bài tập
                  </Link>
                  <Link
                    href="/student/files/docs"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    📘 Tài liệu
                  </Link>
                </div>
              )}
            </div>

            {/* ➕ Đăng tuyển lớp */}
            <button
              onClick={() => router.push("/dashboard/create-class")}
              className="bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md hover:bg-yellow-300 transition border border-yellow-500"
            >
              ➕ Đăng tuyển lớp
            </button>
          </div>
        </div>

        {/* --- USER INFO --- */}
        <div className="flex items-center space-x-3">
          <span>🔔</span>
          <span className="text-sm font-medium">
            {user?.full_name || "Hocvien"}
          </span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
