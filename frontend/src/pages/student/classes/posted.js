import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../utils/api";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";

export default function PostedClasses() {
  const [classes, setClasses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await api.get("/classes");
        setClasses(res.data.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách lớp:", err);
      }
    }
    fetchClasses();
  }, []);

  const handleCancelClass = async (cls) => {
    if (!confirm(`Bạn có chắc muốn hủy lớp ${cls.class_id} không?`)) return;

    try {
      const res = await api.put(`/classes/${cls.class_id}/cancel`, {
        reason: "Người học muốn hủy lớp",
      });
      alert(res.data.message || "Đã gửi yêu cầu hủy lớp.");
    } catch (err) {
      console.error("❌ Lỗi hủy lớp:", err);
      alert("Không thể hủy lớp. Vui lòng thử lại sau.");
    }
  };

  return (
    <div>
      <TopbarStudent />
      <Sidebar />

      <div className="ml-56 pt-[80px] p-6 bg-gray-50 min-h-screen">
        {/* --- Nút quay lại --- */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-[#003366] font-medium hover:text-blue-700 transition"
        >
          ← Quay lại
        </button>

        <h2 className="text-2xl font-semibold text-[#003366] mb-4 flex items-center">
          📘 Lớp đã đăng
        </h2>

        {classes.length === 0 ? (
          <p className="text-gray-500">Bạn chưa đăng lớp nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.class_id}
                className="relative bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="absolute top-3 right-4">
                  {cls.status === "APPROVED_VISIBLE" ? (
                    <span className="text-green-600 text-sm font-semibold">
                      ✅ Đã duyệt
                    </span>
                  ) : cls.status === "PENDING_ADMIN_APPROVAL" ? (
                    <span className="text-orange-500 text-sm font-semibold">
                      ⏳ Chưa duyệt
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Khác</span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-[#003366] mb-2">
                  {cls.subject} – Mã lớp: TN{cls.class_id}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  🎓 Trình độ: {cls.grade}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  💰 Học phí: {cls.tuition_amount.toLocaleString()}đ
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  📍 Khu vực: {cls.city}
                </p>

                <button
                  onClick={() => handleCancelClass(cls)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                  🗑️ Hủy đăng lớp
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
