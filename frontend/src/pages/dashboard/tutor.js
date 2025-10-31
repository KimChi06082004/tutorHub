// frontend/src/pages/dashboard/tutor.js
import { useEffect, useState } from "react";
import api from "../../utils/api";
import SidebarTutor from "../../components/SidebarTutor";
import TopbarTutor from "../../components/TopbarTutor";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

export default function TutorDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [showMap, setShowMap] = useState(false);

  // 🧩 Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 3;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `/classes?status=APPROVED_VISIBLE&subject=${encodeURIComponent(
            search
          )}`
        : "/classes?status=APPROVED_VISIBLE";

      const res = await api.get(url);
      setClasses(res.data.data || res.data || []);
    } catch (err) {
      console.error("❌ Load classes error:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // reset lại trang khi tìm kiếm
    fetchClasses(subject);
  };

  // 🧮 Tính toán chỉ số hiển thị
  const indexOfLast = currentPage * classesPerPage;
  const indexOfFirst = indexOfLast - classesPerPage;
  const currentClasses = classes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(classes.length / classesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <SidebarTutor />
      <TopbarTutor />

      <div className="main-content p-6">
        <h2 className="text-2xl font-bold mb-2">📚 Danh sách lớp đang tuyển</h2>
        <p style={{ color: "#666" }}>
          Lớp đã được duyệt, gia sư có thể apply để nhận lớp
        </p>

        {/* 🔍 Thanh tìm kiếm */}
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

        {/* ✅ Danh sách lớp */}
        <div
          className="content-wrapper"
          style={{ display: "flex", flexDirection: "row", gap: 20 }}
        >
          {/* Danh sách lớp */}
          <div style={{ flex: 2 }}>
            {loading ? (
              <p>⏳ Đang tải lớp...</p>
            ) : currentClasses.length === 0 ? (
              <p>⚠️ Hiện chưa có lớp nào khả dụng</p>
            ) : (
              currentClasses.map((cls) => (
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
                  <p className="text-gray-700">
                    📅 Lịch học:{" "}
                    {(() => {
                      try {
                        const schedule =
                          typeof cls.schedule === "string"
                            ? JSON.parse(cls.schedule)
                            : cls.schedule || {};

                        const daysMap = {
                          T2: "Thứ 2",
                          T3: "Thứ 3",
                          T4: "Thứ 4",
                          T5: "Thứ 5",
                          T6: "Thứ 6",
                          T7: "Thứ 7",
                          CN: "Chủ nhật",
                        };

                        const days =
                          schedule.days
                            ?.map((d) => daysMap[d] || d)
                            .join(", ") || "Chưa rõ";
                        const weeks = schedule.weeks
                          ? `${schedule.weeks} tuần`
                          : "";
                        const from = schedule.timeRange?.from || "";
                        const to = schedule.timeRange?.to || "";

                        return `${days} ${weeks ? `, ${weeks}` : ""} ${
                          from && to ? `, ${from} - ${to}` : ""
                        }`;
                      } catch {
                        return "Chưa có lịch học";
                      }
                    })()}
                  </p>
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
                      router.push(`/tutor/class-detail?id=${cls.class_id}`)
                    }
                  >
                    Chi tiết lớp
                  </button>
                </div>
              ))
            )}

            {/* 🔸 Phân trang nhỏ gọn góc phải */}
            {totalPages > 1 && (
              <div className="flex justify-end items-center mt-4 mr-3 select-none">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 text-sm rounded-md transition ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  ◀
                </button>

                <span className="text-gray-700 text-sm font-medium mx-2">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 text-sm rounded-md transition ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Bản đồ */}
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
