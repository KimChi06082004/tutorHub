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

  // 🎯 Bộ lọc nâng cao
  const [filters, setFilters] = useState({
    gender: "",
    age_range: "",
    education: "",
    city: "",
    district: "",
    ward: "",
  });

  // 🧩 Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 3;

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  // ⚙️ Lấy danh sách lớp theo điều kiện
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      // Nếu có nhập môn học
      if (subject) query.append("subject", subject);

      // Nếu có bộ lọc nâng cao
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "Tất cả") query.append(key, val);
      });

      // 🔗 Gọi API tìm kiếm lớp học (backend mới)
      const url = query.toString()
        ? `/classes/search/classes?${query.toString()}`
        : "/classes/search/classes";

      const res = await api.get(url);
      setClasses(res.data.data || []);
    } catch (err) {
      console.error(" Load classes error:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClasses();
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
        <h2 className="text-2xl font-bold mb-2"> Danh sách lớp đang tuyển</h2>

        {/* 🔍 Thanh tìm kiếm & Bộ lọc (phiên bản mới) */}
        <div className="bg-white rounded-xl shadow-md p-5 mt-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Ô nhập môn học */}
            <input
              type="text"
              placeholder="Nhập môn học (VD: Toán, Anh...)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full lg:w-1/4 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {/* Giới tính */}
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg p-3 w-full lg:w-1/5 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            {/* Thành phố */}
            <input
              name="city"
              placeholder="Nhập thành phố (VD: Hồ Chí Minh)"
              value={filters.city}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg p-3 w-full lg:w-1/4 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {/* Độ tuổi (demo 18 - 60) */}
            <div className="flex items-center gap-2 w-full lg:w-[150px]">
              <input
                type="number"
                min="18"
                placeholder="18"
                className="border border-gray-300 rounded-lg p-2 w-1/2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Đến"
                className="border border-gray-300 rounded-lg p-2 w-1/2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Nút tìm kiếm */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition w-full lg:w-auto"
            >
              🔍 <span>Tìm kiếm</span>
            </button>
          </div>
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
              <p> Hiện chưa có lớp nào khả dụng</p>
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
                  <p className="text-gray-700"> Môn: {cls.subject}</p>
                  <p className="text-gray-700">
                    Học phí:{" "}
                    {cls.tuition_amount
                      ? `${cls.tuition_amount.toLocaleString()} VND/h`
                      : "Thoả thuận"}
                  </p>
                  <p className="text-gray-700">
                    Yêu cầu: {cls.teacher_gender || "Không yêu cầu"},{" "}
                    {cls.education_level || "Không yêu cầu"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    Khu vực:{" "}
                    {[cls.ward, cls.district, cls.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
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

            {/* 🔸 Phân trang nhỏ gọn */}
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
            {showMap ? "Ẩn bản đồ" : " Lọc theo bản đồ Việt Nam"}
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
