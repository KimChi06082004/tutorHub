// frontend/src/components/Sidebar.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();

  const menus = [
    { label: "Về trang chủ", icon: "🏠", path: "/dashboard/tutor" },
    { label: "Ứng tuyển lớp", icon: "👨‍🏫", path: "/dashboard/tutor/apply" },
    { label: "Chọn đề thi", icon: "📝", path: "/dashboard/tutor/exams" },
    { label: "Xem bài giảng", icon: "📖", path: "/dashboard/tutor/lessons" },
  ];

  return (
    <aside className="fixed left-0 top-[70px] h-[calc(100vh-70px)] w-56 bg-white border-r border-gray-200 shadow-sm z-40">
      {/* Logo */}
      <div className="flex items-center justify-center py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#003366] cursor-pointer">
          📘 DayThem<span className="text-yellow-400">.com</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="mt-4 flex flex-col">
        {menus.map((m) => {
          const active = router.pathname === m.path;
          return (
            <Link key={m.path} href={m.path}>
              <div
                className={`flex items-center px-4 py-2.5 mx-2 my-1 rounded-md cursor-pointer transition-colors duration-150
                  ${
                    active
                      ? "bg-[#004080] text-white font-semibold"
                      : "text-gray-700 hover:bg-[#e6f0ff] hover:text-[#004080]"
                  }
                `}
              >
                <span className="mr-3 text-lg">{m.icon}</span>
                <span className="text-sm">{m.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
