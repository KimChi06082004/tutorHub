import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { logout, getAuthUser } from "../utils/auth";
import Link from "next/link";
import api from "../utils/api";

export default function TopbarStudent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestId, setLatestId] = useState(null); // ✅ theo dõi ID mới nhất
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = getAuthUser();
      setUser(u);
      setMounted(true);
    }
  }, []);

  // 🟢 Lấy thông báo định kỳ
  useEffect(() => {
    if (!mounted) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data.success) {
          const newNoti = res.data.data;
          const unread = newNoti.filter((n) => !n.is_read);

          // ✅ CHỈ phát âm thanh khi có thông báo mới thật sự
          if (
            newNoti.length > 0 &&
            latestId !== null && // bỏ lần đầu load
            newNoti[0].notification_id !== latestId
          ) {
            audioRef.current?.play().catch(() => {});
          }

          // ✅ Cập nhật dữ liệu
          if (newNoti.length > 0) setLatestId(newNoti[0].notification_id);
          setNotifications(newNoti);
          setUnreadCount(unread.length);
        }
      } catch (err) {
        console.error("❌ Lỗi tải thông báo:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [mounted, latestId]); // ✅ chỉ lặp khi latestId thay đổi

  if (!mounted) return null;

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#003366] text-white shadow-md z-[9998]">
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
              className="w-10 h-14 object-contain ml-2 mr-5 rounded-sm"
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
                Quản lý tuyển chọn ▾
              </button>
              {openMenu === "select" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/classes/posted"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Lớp đã đăng
                  </Link>
                  <Link
                    href="/student/tutor-requests"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Gia sư ứng tuyển
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
                Quản lý học phí ▾
              </button>
              {openMenu === "payment" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/payments/pending"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Cần thanh toán
                  </Link>
                  <Link
                    href="/student/payments/paid"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Đã thanh toán
                  </Link>
                  <Link
                    href="/student/payments/cancelled"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Hủy thanh toán
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
                Quản lý lớp học ▾
              </button>
              {openMenu === "class" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/classes/active"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Lịch đang học
                  </Link>
                  <Link
                    href="/student/classes/completed"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Lớp kết thúc
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
                Quản lý thư mục ▾
              </button>
              {openMenu === "folder" && (
                <div className="absolute left-0 bg-[#004080] text-white rounded-md mt-1 w-56">
                  <Link
                    href="/student/files/homework"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Bài tập
                  </Link>
                  <Link
                    href="/student/files/docs"
                    className="block px-4 py-2 hover:bg-[#0059b3]"
                    onClick={() => setOpenMenu(null)}
                  >
                    Tài liệu
                  </Link>
                </div>
              )}
            </div>

            {/* ➕ Đăng tuyển lớp */}
            <button
              onClick={() => router.push("/dashboard/create-class")}
              className="bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md hover:bg-yellow-300 transition border border-yellow-500"
            >
              Đăng tuyển lớp
            </button>
          </div>
        </div>

        {/* --- USER INFO + THÔNG BÁO --- */}
        <div className="flex items-center space-x-3 relative">
          {/* 🔔 Icon chuông */}
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
                          router.push("/student/notifications");
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
                    href="/student/notifications"
                    className="text-blue-600 text-sm font-medium hover:underline"
                    onClick={() => setOpenMenu(null)}
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              </div>
            )}
          </div>

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

          {/* 🎵 Âm thanh */}
          <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
        </div>
      </div>
    </header>
  );
}
