import { useState } from "react";
import api from "../../utils/api";
import SidebarTutor from "../../components/SidebarTutor";
import TopbarTutor from "../../components/TopbarTutor";
import { useRouter } from "next/router";

export default function ClassSearch() {
  const [filters, setFilters] = useState({
    gender: "",
    age_range: "",
    education: "",
    city: "",
    district: "",
    ward: "",
  });
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/classes/search/classes?${query}`); // ✅ API khác
      setResults(res.data.data || []);
    } catch (err) {
      console.error(" Lỗi tìm kiếm lớp:", err);
      alert("Không thể tìm kiếm lớp học!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarTutor />
      <div className="flex-1">
        <TopbarTutor />
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            🔍 Tìm kiếm lớp học
          </h1>

          {/* Bộ lọc */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <select
              name="gender"
              value={filters.gender}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            >
              <option value="">Giới tính học viên yêu cầu (Tất cả)</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            <select
              name="age_range"
              value={filters.age_range}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            >
              <option value="">Độ tuổi (Tất cả)</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-50">36-50</option>
            </select>

            <select
              name="education"
              value={filters.education}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            >
              <option value="">Trình độ (Tất cả)</option>
              <option value="Cao đẳng">Cao đẳng</option>
              <option value="Đại học">Đại học</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
            </select>

            <input
              name="city"
              placeholder="Thành phố..."
              value={filters.city}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <input
              name="district"
              placeholder="Quận / Huyện..."
              value={filters.district}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />
            <input
              name="ward"
              placeholder="Phường / Xã..."
              value={filters.ward}
              onChange={handleChange}
              className="border p-2 rounded-lg"
            />

            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg p-3 col-span-2 md:col-span-3"
            >
              🔍 Tìm kiếm lớp học
            </button>
          </div>

          {/* Kết quả */}
          {results.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((cls) => (
                <div
                  key={cls.class_id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg border border-gray-100 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {cls.subject} - {cls.grade}
                  </h3>
                  <p className="text-gray-600">
                    <b>Giới tính yêu cầu:</b>{" "}
                    {cls.teacher_gender || "Không yêu cầu"}
                  </p>
                  <p className="text-gray-600">
                    <b>Trình độ:</b> {cls.education_level || "Không yêu cầu"}
                  </p>
                  <p className="text-gray-600">
                    <b>Địa chỉ:</b>{" "}
                    {[cls.ward, cls.district, cls.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-gray-600">
                    <b>Học phí:</b>{" "}
                    {cls.tuition_amount
                      ? `${cls.tuition_amount.toLocaleString()} đ/giờ`
                      : "Thoả thuận"}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/tutor/class-detail?id=${cls.class_id}`)
                    }
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              Không tìm thấy lớp học phù hợp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
