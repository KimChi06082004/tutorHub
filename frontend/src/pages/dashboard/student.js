import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import SidebarStudent from "../../components/SidebarStudent";
import Footer from "../../components/Footer";
import SidebarToggle from "../../components/SidebarToggle";
import dynamic from "next/dynamic";
import TopbarStudent from "../../components/TopbarStudent";

const MapWrapper = dynamic(() => import("../../components/MapWrapper"), {
  ssr: false,
});

export default function StudentDashboard() {
  const router = useRouter();
  const [tutors, setTutors] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [subject, setSubject] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧩 Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 3;

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async (filters = {}) => {
    setLoading(true);
    try {
      // 🎯 Tạo query params linh hoạt
      const params = new URLSearchParams({
        status: "APPROVED",
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.city && { city: filters.city }),
        ...(filters.ageMin && { ageMin: filters.ageMin }),
        ...(filters.ageMax && { ageMax: filters.ageMax }),
      });

      const res = await api.get(`/tutors?${params.toString()}`);
      setTutors(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách gia sư:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTutors({ subject, gender, city, ageMin, ageMax });
  };

  // 🧮 Phân trang
  const indexOfLast = currentPage * tutorsPerPage;
  const indexOfFirst = indexOfLast - tutorsPerPage;
  const currentTutors = tutors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(tutors.length / tutorsPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // ⚙️ Lọc các tutor có tọa độ hợp lệ cho bản đồ
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

        {/* Bộ lọc tìm kiếm */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
          {/* Môn học */}
          <input
            type="text"
            placeholder="Nhập môn học (VD: Toán, Anh, Lý...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full sm:w-60 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          {/* Giới tính */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full sm:w-48 focus:ring-2 focus:ring-blue-300 outline-none"
          >
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          {/* Thành phố */}
          <input
            type="text"
            placeholder="Nhập thành phố (VD: Hồ Chí Minh)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full sm:w-60 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          {/* Tuổi từ - đến */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="18"
              max="100"
              placeholder="Tuổi từ"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-24 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="18"
              max="100"
              placeholder="Đến"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-24 focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Nút tìm kiếm */}
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
          >
            {loading ? "Đang tìm..." : "🔍 Tìm kiếm"}
          </button>
        </div>

        {/* Danh sách gia sư + Bản đồ */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Danh sách gia sư */}
          <div className="flex-1">
            {loading ? (
              <p>⏳ Đang tải danh sách gia sư...</p>
            ) : currentTutors.length === 0 ? (
              <p>Không có gia sư nào phù hợp 😢</p>
            ) : (
              currentTutors.map((t) => (
                <div
                  key={t.tutor_id}
                  className="border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {t.full_name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    🎓 {t.university || "Đại học"} –{" "}
                    {t.major || "Chuyên ngành không rõ"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    💵{" "}
                    {t.hourly_rate
                      ? `${t.hourly_rate.toLocaleString()} đ/giờ`
                      : "Thoả thuận"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    ⚧ {t.gender || "Không rõ"} | 🎂{" "}
                    {t.age ? `${t.age} tuổi` : ""}
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

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 select-none">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  ◀
                </button>
                <span className="mx-2 text-gray-700 text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
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
          <div className="flex-1 hidden lg:block">
            <MapWrapper role="student" tutors={validTutors} />
          </div>
        </div>

        {/* Mobile Bản đồ */}
        <div className="lg:hidden mt-4">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Ẩn bản đồ" : "🌍 Lọc theo bản đồ Việt Nam"}
          </button>

          {showMap && (
            <div className="fixed inset-0 bg-white z-50">
              <button
                className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded"
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

        <Footer />
      </div>
    </div>
  );
}
