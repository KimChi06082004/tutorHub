import { useEffect, useState } from "react";
import api from "../../utils/api";
import TopbarTutor from "../../components/TopbarTutor";
import SidebarTutor from "../../components/SidebarTutor";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";

export default function TutorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | read | unread
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (noti) => {
    // Chuyển hướng dựa trên loại thông báo
    if (noti.link) {
      router.push(noti.link);
    } else {
      switch (noti.type) {
        case "NEW_CLASS_ASSIGNED":
          router.push("/tutor/classes/active");
          break;
        case "PAYMENT_SUCCESS":
          router.push("/tutor/payments/received");
          break;
        case "CLASS_CANCELLED":
          router.push("/tutor/classes/cancelled");
          break;
        default:
          alert("Thông báo này không có trang chi tiết.");
      }
    }

    // Đánh dấu đã đọc
    api.put(`/notifications/${noti.notification_id}/read`).catch(() => {});
  };

  const filteredList =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.is_read);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarTutor />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-[#003366] mb-4">
              🔔 Thông báo của bạn
            </h2>

            {/* Bộ lọc */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-md ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Chưa đọc
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 rounded-md ${
                  filter === "read"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Đã đọc
              </button>
            </div>

            {/* Danh sách thông báo */}
            {loading ? (
              <p className="text-gray-500 text-center">
                ⏳ Đang tải thông báo...
              </p>
            ) : filteredList.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                Không có thông báo nào.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredList.map((noti) => (
                  <li
                    key={noti.notification_id}
                    onClick={() => handleClick(noti)}
                    className={`p-4 cursor-pointer transition ${
                      noti.is_read ? "bg-gray-50" : "bg-blue-50"
                    } hover:bg-blue-100 rounded-md`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#003366]">
                          {noti.title}
                        </p>
                        <p className="text-sm text-gray-700">{noti.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          🕒{" "}
                          {new Date(noti.created_at).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {!noti.is_read && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Mới
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
