// frontend/src/pages/dashboard/tutor.js
import { useEffect, useState } from "react";
import api from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import TopbarTutor from "../../components/TopbarTutor";
import dynamic from "next/dynamic";

// ✅ Import động VietnamMap (Leaflet)
const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false, // ❗ Tắt SSR để tránh lỗi window is not defined
});

export default function TutorDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(""); // 🔍 Môn học tìm kiếm
  const [showMap, setShowMap] = useState(false); // Map toggle cho mobile

  // ✅ Tải danh sách lớp khi vào trang
  useEffect(() => {
    fetchClasses();
  }, []);

  // ✅ Hàm tải danh sách lớp (có thể lọc theo môn học)
  const fetchClasses = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `/classes?status=APPROVED_VISIBLE&subject=${encodeURIComponent(
            search
          )}`
        : "/classes?status=APPROVED_VISIBLE";

      const res = await api.get(url);
      setClasses(res.data.data || res.data || []); // ✅ luôn là array
    } catch (err) {
      console.error("❌ Load classes error:", err);
      setClasses([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  // ✅ Khi bấm “Tìm kiếm”
  const handleSearch = () => {
    fetchClasses(subject);
  };

  return (
    <div>
      <Sidebar />
      <TopbarTutor />

      <div className="main-content p-6">
        <h2 className="text-2xl font-bold mb-2">📚 Danh sách lớp đang tuyển</h2>
        <p style={{ color: "#666" }}>
          Lớp đã được duyệt, gia sư có thể apply để nhận lớp
        </p>

        {/* 🔍 Thanh tìm kiếm môn học */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-5">
          <input
            type="text"
            placeholder="Nhập môn học (VD: Toán, Anh, Lý...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full sm:w-96 focus:ring-2 focus:ring-blue-300 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Đang tìm..." : "🔍 Tìm lớp"}
          </button>
        </div>

        {/* ✅ Bố cục danh sách lớp + bản đồ */}
        <div
          className="content-wrapper"
          style={{ display: "flex", flexDirection: "row", gap: 20 }}
        >
          {/* Danh sách lớp */}
          <div style={{ flex: 2 }}>
            {loading ? (
              <p>⏳ Đang tải lớp...</p>
            ) : !Array.isArray(classes) || classes.length === 0 ? (
              <p>⚠️ Hiện chưa có lớp nào khả dụng</p>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className="tutor-card border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition"
                  style={{ background: "#fff" }}
                >
                  <h3 className="text-lg font-semibold text-blue-600 mb-1">
                    Mã lớp: TN{cls.class_id}
                  </h3>
                  <p className="text-gray-700">
                    👤 Học viên: <b>{cls.student_name}</b>
                  </p>
                  <p className="text-gray-700">📘 Môn: {cls.subject}</p>
                  <p className="text-gray-700">📅 Lịch học: {cls.schedule}</p>
                  <p className="text-gray-700">
                    💰 Học phí:{" "}
                    {cls.tuition_amount
                      ? `${cls.tuition_amount.toLocaleString()} VND/h`
                      : "Thoả thuận"}
                  </p>
                  <p className="text-gray-700 mb-2">📍 Khu vực: {cls.city}</p>
                  <button
                    style={{
                      background: "#0d6efd",
                      color: "#fff",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      alert(
                        `👉 Sau này mở popup chi tiết / apply lớp ${cls.class_id}`
                      )
                    }
                  >
                    Chi tiết lớp
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ✅ Bản đồ Việt Nam hiển thị avatar học viên */}
          <div
            className="map-container desktop-only"
            style={{
              flex: 1,
              minHeight: 500,
              border: "1px solid #ddd",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <VietnamMap points={classes} />
          </div>
        </div>

        {/* ✅ Map toggle cho mobile */}
        <div className="mobile-only mt-6 text-center">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Ẩn bản đồ" : "🌍 Lọc theo bản đồ Việt Nam"}
          </button>

          {showMap && (
            <div className="map-overlay fixed inset-0 bg-white z-50">
              <button
                className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => setShowMap(false)}
              >
                ✖ Đóng
              </button>
              <div className="h-full w-full mt-10">
                <VietnamMap points={classes} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
