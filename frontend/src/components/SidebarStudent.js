import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Users, BookOpen, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function SidebarStudent() {
  const router = useRouter();

  // 🧠 Hàm hiển thị toast “Đang phát triển”
  const notifyDeveloping = () =>
    toast(" Tính năng đang được phát triển!", {
      icon: "🛠️",
      style: {
        borderRadius: "10px",
        background: "#003366",
        color: "#fff",
      },
    });

  // 🧩 Danh sách menu
  const menus = [
    {
      label: "Về trang chủ",
      icon: <Home size={22} />,
      path: "/dashboard/student",
      type: "link",
    },
    {
      label: "Chọn người dạy",
      icon: <Users size={22} />,
      type: "dev", // 🚧 chưa có trang
    },
    {
      label: "Làm bài tập",
      icon: <BookOpen size={22} />,
      type: "dev", // 🚧 chưa có trang
    },
    {
      label: "Đọc tài liệu",
      icon: <FileText size={22} />,
      type: "dev", // 🚧 chưa có trang
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
        {menus.map((item) => {
          const active = router.pathname === item.path;
          const baseStyle =
            "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition select-none";
          const activeStyle = "bg-blue-100 text-blue-700";
          const normalStyle = "text-gray-700 hover:bg-gray-100";

          // 🚧 Nếu là tính năng đang phát triển
          if (item.type === "dev") {
            return (
              <button
                key={item.label}
                onClick={notifyDeveloping}
                className={`${baseStyle} ${normalStyle} w-full text-left`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          }

          // ✅ Nếu là trang thật
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`${baseStyle} ${active ? activeStyle : normalStyle}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
