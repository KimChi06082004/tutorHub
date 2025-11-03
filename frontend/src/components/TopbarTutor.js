import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { logout, getAuthUser } from "../utils/auth";
import Link from "next/link";
import api from "../utils/api";
import toast from "react-hot-toast"; // ✅ thêm

export default function TopbarTutor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  // 🟢 Thông báo
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestId, setLatestId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = getAuthUser();
      setUser(u);
      setMounted(true);
    }
  }, []);

  // 🧠 Hàm hiện thông báo “Đang phát triển”
  const notifyDeveloping = () =>
    toast("🚧 Tính năng đang được phát triển!", {
      icon: "🛠️",
      style: {
        borderRadius: "10px",
        background: "#003366",
        color: "#fff",
      },
    });

  // 🟢 Lấy thông báo định kỳ (chỉ khi đã mount)
  useEffect(() => {
    if (!mounted) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data.success) {
          const data = res.data.data || [];
          const unread = data.filter((n) => !n.is_read);

          if (data.length > 0 && data[0].notification_id !== latestId) {
            if (latestId !== null) {
              audioRef.current?.play().catch(() => {});
            }
            setLatestId(data[0].notification_id);
          }

          setNotifications(data);
          setUnreadCount(unread.length);
        }
      } catch (err) {
        console.error("❌ Lỗi tải thông báo:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#003366] text-white shadow-md z-50">
      <div className="flex items-center justify-between px-8 py-3">
        {/* --- Logo + Menu --- */}
        <div className="flex items-center space-x-8">
          <div
            className="flex items-center cursor-pointer select-none ml-2"
            onClick={() => router.push("/tutor/classes/active")}
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

          {/* --- MENU --- */}
          <div className="flex items-center space-x-3 ml-6">
            {/* 📑 Quản lý ứng tuyển */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("select")}
                className="border border-[#6699cc] bg-transparent px-3 py-1 rounded-md hover:bg-[#004080] transition"
              >
                Quản lý ứng tuyển ▾
              </button>
              {openMenu === "select" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56 shadow-md">
                  {/* ✅ Khi click → hiện “Đang phát triển” */}
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      notifyDeveloping();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-[#0059b3]"
                  >
                    Lớp đã ứng tuyển
                  </button>

                  <Link
                    href="/tutor/SelectedClasses"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Được chọn dạy
                  </Link>
                </div>
              )}
            </div>

            {/* 💰 Quản lý lệ phí */}
            <div className="relative">
              <button
                onClick={() => toggleMenu("payment")}
                className="border border-[#6699cc] bg-transparent px-3 py-1 rounded-md hover:bg-[#004080] transition"
              >
                Quản lý lệ phí ▾
              </button>
              {openMenu === "payment" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56 shadow-md">
                  <Link
                    href="/tutor/payments"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    💸 Cần thanh toán
                  </Link>
                  <Link
                    href="/tutor/payments/paid"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    ✅ Đã thanh toán
                  </Link>
                  <Link
                    href="/tutor/payments/cancelled"
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
                className="border border-[#6699cc] bg-transparent px-3 py-1 rounded-md hover:bg-[#004080] transition"
              >
                📚 Quản lý lớp học ▾
              </button>
              {openMenu === "class" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56 shadow-md">
                  <Link
                    href="/tutor/classes/active"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    📅 Lịch dạy học
                  </Link>
                  <Link
                    href="/tutor/classes/completed"
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
                className="border border-[#6699cc] bg-transparent px-3 py-1 rounded-md hover:bg-[#004080] transition"
              >
                📁 Quản lý thư mục ▾
              </button>
              {openMenu === "folder" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56 shadow-md">
                  {/* ✅ Hiển thị “Đang phát triển” */}
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      notifyDeveloping();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-[#0059b3]"
                  >
                    ✏️ Bài tập đã giao
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      notifyDeveloping();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-[#0059b3]"
                  >
                    📘 Tài liệu đã giao
                  </button>
                </div>
              )}
            </div>

            {/* 🧑‍🏫 Cập nhật CV */}
            <button
              onClick={() => router.push("/tutor/update-cv")}
              className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded-md hover:bg-yellow-300 transition border border-yellow-500"
            >
              🧑‍🏫 Cập nhật CV
            </button>
          </div>
        </div>

        {/* --- USER INFO + THÔNG BÁO --- */}
        <div className="flex items-center space-x-3 relative">
          {/* 🔔 Thông báo */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("notifications")}
              className="relative text-2xl"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {openMenu === "notifications" && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-3 font-semibold bg-gray-100 border-b">
                  Thông báo gần đây
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-sm text-center">
                      Không có thông báo nào
                    </p>
                  ) : (
                    notifications.slice(0, 5).map((noti) => (
                      <div
                        key={noti.notification_id}
                        className={`p-3 border-b cursor-pointer ${
                          noti.is_read ? "bg-white" : "bg-blue-50"
                        } hover:bg-blue-100`}
                        onClick={() => {
                          router.push("/tutor/notifications");
                          setOpenMenu(null);
                        }}
                      >
                        <p className="font-medium text-[#003366]">
                          {noti.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(noti.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-center py-2 border-t bg-gray-50">
                  <Link
                    href="/tutor/notifications"
                    className="text-blue-600 text-sm font-medium hover:underline"
                    onClick={() => setOpenMenu(null)}
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* USER + Logout */}
          <span className="text-sm font-medium">
            {user?.full_name || "Gia sư"}
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

          {/* 🎵 Âm thanh */}
          <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
        </div>
      </div>
    </header>
  );
}
