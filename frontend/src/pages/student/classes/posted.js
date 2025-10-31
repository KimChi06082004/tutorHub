import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../utils/api";
import TopbarStudent from "../../../components/TopbarStudent";
import SidebarStudent from "../../../components/SidebarStudent";

export default function PostedClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await api.get("/classes");
        setClasses(res.data.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách lớp:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const handleCancelClass = async (cls) => {
    if (!confirm(`Bạn có chắc muốn hủy lớp TN${cls.class_id} không?`)) return;
    try {
      const res = await api.put(`/classes/${cls.class_id}/cancel`, {
        reason: "Người học muốn hủy lớp",
      });
      alert(res.data.message || "Đã gửi yêu cầu hủy lớp.");
      // Cập nhật lại danh sách sau khi hủy
      setClasses((prev) => prev.filter((c) => c.class_id !== cls.class_id));
    } catch (err) {
      console.error("❌ Lỗi hủy lớp:", err);
      alert("Không thể hủy lớp. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarStudent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopbarStudent />

        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-7xl mx-auto">
            {/* Nút quay lại */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-5 text-[#003366] font-medium hover:text-blue-700 transition"
            >
              ← Quay lại
            </button>

            {/* Tiêu đề */}
            <h2 className="text-2xl font-semibold text-[#003366] mb-6 flex items-center gap-2">
              📘 Lớp đã đăng
            </h2>

            {loading ? (
              <p className="text-gray-500 text-center py-10">
                ⏳ Đang tải danh sách lớp...
              </p>
            ) : classes.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                Bạn chưa đăng lớp nào.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {classes.map((cls) => (
                  <div
                    key={cls.class_id}
                    className="relative bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200"
                  >
                    {/* Trạng thái */}
                    <div className="absolute top-4 right-4">
                      {cls.status === "APPROVED_VISIBLE" ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          ✅ Đã duyệt
                        </span>
                      ) : cls.status === "PENDING_ADMIN_APPROVAL" ? (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                          ⏳ Chờ duyệt
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
                          ⚙️ Khác
                        </span>
                      )}
                    </div>

                    {/* Thông tin lớp */}
                    <h3 className="font-bold text-lg text-[#003366] mb-2">
                      {cls.subject} – Mã lớp:{" "}
                      <span className="text-blue-700">TN{cls.class_id}</span>
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      🎓 Trình độ: Lớp {cls.grade}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      💰 Học phí:{" "}
                      <span className="font-semibold">
                        {cls.tuition_amount?.toLocaleString()}đ
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      📍 Khu vực: {cls.city || "Chưa rõ"}
                    </p>

                    {/* Nút hành động */}
                    <button
                      onClick={() => handleCancelClass(cls)}
                      className="w-full bg-red-500 text-white py-2 mt-3 rounded-md hover:bg-red-600 transition font-medium"
                    >
                      🗑️ Hủy đăng lớp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
