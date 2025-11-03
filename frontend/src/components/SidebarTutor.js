import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Home, Users, BookOpen, FileText, FilePen } from "lucide-react"; // ✅ thêm FilePen cho CV

export default function SidebarTutor() {
  const router = useRouter();

  // 🧠 Hàm hiển thị toast “Đang phát triển”
  const notifyDeveloping = () =>
    toast("🚧 Tính năng đang được phát triển!", {
      icon: "🛠️",
      style: {
        borderRadius: "10px",
        background: "#003366",
        color: "#fff",
      },
    });

  // ✅ Cấu hình menu rõ ràng, thống nhất type
  const menus = [
    {
      label: "Về trang chủ",
      icon: <Home size={20} />,
      path: "/dashboard/tutor",
      type: "link",
    },
    {
      label: "Ứng tuyển lớp",
      icon: <Users size={20} />,
      type: "dev",
    },
    {
      label: "Cập nhật CV",
      icon: <FilePen size={20} />,
      type: "dev",
    },
    {
      label: "Chọn đề thi",
      icon: <FileText size={20} />,
      type: "dev",
    },
    {
      label: "Xem bài giảng",
      icon: <BookOpen size={20} />,
      type: "dev",
    },
  ];

  return (
    //     <aside className="fixed top-0 left-0 w-64 bg-white border-r border-gray-200 h-screen pt-[80px] shadow-sm z-40">
    //       <nav className="mt-2 space-y-1">
    //         {menus.map((m) => {
    //           const active = router.pathname === m.path;

    //           const baseStyle =
    //             "flex items-center gap-3 px-5 py-3 text-sm font-medium cursor-pointer transition-all rounded-lg select-none";

    //           const activeStyle =
    //             "bg-[#e6f0ff] text-[#0d6efd] font-semibold border-r-4 border-[#0d6efd]";

    //           const normalStyle =
    //             "text-gray-700 hover:bg-[#f5f9ff] hover:text-[#003366]";

    //           // ⚙️ Nếu là tính năng đang phát triển
    //           if (m.type === "dev") {
    //             return (
    //               <button
    //                 key={m.label}
    //                 onClick={notifyDeveloping}
    //                 className={`${baseStyle} ${normalStyle} w-full text-left`}
    //               >
    //                 {m.icon}
    //                 <span>{m.label}</span>
    //               </button>
    //             );
    //           }

    //           // ⚙️ Nếu là link thật
    //           return (
    //             <Link key={m.path} href={m.path}>
    //               <div
    //                 className={`${baseStyle} ${active ? activeStyle : normalStyle}`}
    //               >
    //                 {m.icon}
    //                 <span>{m.label}</span>
    //               </div>
    //             </Link>
    //           );
    //         })}
    //       </nav>
    //     </aside>
    //   );
    // }
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
