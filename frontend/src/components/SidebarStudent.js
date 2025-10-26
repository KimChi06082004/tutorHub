import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Users, BookOpen, FileText } from "lucide-react"; // icon từ lucide-react

export default function SidebarStudent() {
  const router = useRouter();

  // Danh sách menu chính
  const menus = [
    {
      label: "Về trang chủ",
      icon: <Home size={22} />,
      path: "/dashboard/student",
    },
    {
      label: "Chọn người dạy",
      icon: <Users size={22} />,
      path: "/dashboard/student/classes-posted", // lớp học đã đăng
    },
    {
      label: "Làm bài tập",
      icon: <BookOpen size={22} />,
      path: "/dashboard/student/assignments",
    },
    {
      label: "Đọc tài liệu",
      icon: <FileText size={22} />,
      path: "/dashboard/student/resources",
    },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen fixed top-0 left-0 shadow-md flex flex-col">
      {/* Logo + slogan */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold tracking-wide leading-tight text-blue-800">
          {/* DAYTHEM<span className="text-yellow-500">.com</span> */}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {/* Đồng hành cùng bạn, bứt phá giới hạn */}
        </p>
      </div>

      {/* Danh sách menu */}
      <nav className="flex-1 p-4 space-y-2 mt-6">
        {menus.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              router.pathname === item.path
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
