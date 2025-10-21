// frontend/src/components/SidebarTutor.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function SidebarTutor() {
  const router = useRouter();

  const menus = [
    { label: "Về trang chủ", icon: "🏠", path: "/dashboard/tutor" },
    { label: "Ứng tuyển lớp", icon: "👨‍🏫", path: "/dashboard/tutor/apply" },
    { label: "Cập nhật CV", icon: "📄", path: "/tutor/update-cv" },
    { label: "Chọn đề thi", icon: "📝", path: "/dashboard/tutor/exams" },
    { label: "Xem bài giảng", icon: "📖", path: "/dashboard/tutor/lessons" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-56 bg-white border-r border-gray-200 h-screen pt-[80px] shadow-sm z-40">
      {/* --- Logo --- */}
      <div className="flex flex-col items-center pb-4 border-b border-gray-100">
        <img
          src="/logo-daythem.png"
          alt="DayThem Logo"
          className="w-20 h-20 object-contain mb-2"
        />
        <h2 className="text-lg font-bold text-[#003366]">
          DayThem<span className="text-yellow-500">.com</span>
        </h2>
      </div>

      {/* --- Menu --- */}
      <nav className="mt-4">
        {menus.map((m) => {
          const active = router.pathname === m.path;
          return (
            <Link key={m.path} href={m.path}>
              <div
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium cursor-pointer transition-all ${
                  active
                    ? "bg-[#e6f0ff] text-[#0d6efd] border-r-4 border-[#0d6efd]"
                    : "text-gray-700 hover:bg-[#f5f9ff] hover:text-[#003366]"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
