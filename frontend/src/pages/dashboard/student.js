import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import SidebarStudent from "../../components/SidebarStudent";
import Footer from "../../components/Footer";
import SidebarToggle from "../../components/SidebarToggle";
import dynamic from "next/dynamic";
import TopbarStudent from "../../components/TopbarStudent";

// ⚙️ Bản đồ được load động (client-side)
const MapWrapper = dynamic(() => import("../../components/MapWrapper"), {
  ssr: false,
});

export default function StudentDashboard() {
  const router = useRouter();
  const [tutors, setTutors] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `/tutors?subject=${encodeURIComponent(search)}&status=APPROVED`
        : "/tutors?status=APPROVED";

      const res = await api.get(url);
      setTutors(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải tutors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTutors(subject);
  };

  // 🧠 Debug: kiểm tra dữ liệu tọa độ của tutors
  useEffect(() => {
    if (tutors.length > 0) {
      console.log(
        "🗺️ Tutors hiển thị bản đồ:",
        tutors.map((t) => ({
          id: t.tutor_id,
          name: t.full_name,
          lat: t.lat,
          lng: t.lng,
        }))
      );
    }
  }, [tutors]);

  // ⚙️ Lọc các tutor có tọa độ hợp lệ để truyền vào bản đồ
  const validTutors = tutors.filter(
    (t) =>
      t.lat &&
      t.lng &&
      !Number.isNaN(parseFloat(t.lat)) &&
      !Number.isNaN(parseFloat(t.lng))
  );

  return (
    <div>
      {/* Sidebar & Topbar */}
      <div className="desktop-only">
        <SidebarStudent />
      </div>

      <div className="mobile-only">
        <SidebarToggle />
      </div>

      <div className="desktop-only">
        <TopbarStudent />
      </div>

      {/* Nội dung chính */}
      <div className="main-content p-6">
        <h2 className="text-2xl font-bold mb-4">👩‍🏫 Danh sách gia sư</h2>

        {/* Ô tìm kiếm */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Nhập môn học (VD: Toán, Anh, Lý...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full sm:w-80 focus:ring-2 focus:ring-blue-300 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Đang tìm..." : "🔍 Tìm kiếm"}
          </button>
        </div>

        {/* Danh sách gia sư + Bản đồ */}
        <div
          className="content-wrapper"
          style={{ display: "flex", gap: "20px" }}
        >
          {/* Danh sách gia sư */}
          <div className="tutor-list" style={{ flex: 1 }}>
            {loading ? (
              <p>⏳ Đang tải danh sách gia sư...</p>
            ) : tutors.length === 0 ? (
              <p>Không có gia sư nào phù hợp 😢</p>
            ) : (
              tutors.map((t) => (
                <div
                  key={t.tutor_id}
                  className="tutor-card border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {t.full_name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    🎓 {t.degree || "Đại học"} – {t.experience || 0} năm kinh
                    nghiệm
                  </p>
                  <p className="text-gray-600 mb-1">
                    💵{" "}
                    {t.hourly_rate
                      ? `${t.hourly_rate.toLocaleString()} đ/giờ`
                      : "Thoả thuận"}
                  </p>
                  <p className="text-gray-600 mb-2">
                    📍 {t.city || "Không rõ khu vực"}
                  </p>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    onClick={() =>
                      router.push(`/student/TutorDetail?id=${t.tutor_id}`)
                    }
                  >
                    Xem hồ sơ
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bản đồ (Desktop) */}
          <div className="map-container desktop-only" style={{ flex: 1 }}>
            <MapWrapper role="student" tutors={validTutors} />
          </div>
        </div>

        {/* Bản đồ (Mobile) */}
        <div className="mobile-only">
          <button
            className="floating-map-btn bg-blue-600 text-white px-5 py-2 rounded-lg mt-4"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Ẩn bản đồ" : "🌍 Lọc theo bản đồ Việt Nam"}
          </button>

          {showMap && (
            <div className="map-overlay fixed inset-0 bg-white z-50">
              <button
                className="close-map-btn absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => setShowMap(false)}
              >
                ✖ Đóng
              </button>
              <div className="h-full w-full mt-10">
                <MapWrapper role="student" tutors={validTutors} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
