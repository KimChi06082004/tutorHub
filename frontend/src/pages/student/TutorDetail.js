import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import TopbarStudent from "../../components/TopbarStudent";
import dynamic from "next/dynamic";
import { IoArrowBackOutline } from "react-icons/io5";

// Map chỉ render phía client
const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

export default function TutorDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequested, setIsRequested] = useState(false); // ✅ trạng thái nút gửi

  // Lấy thông tin gia sư
  useEffect(() => {
    if (!id) return;
    const fetchTutor = async () => {
      try {
        const res = await api.get(`/tutors/${id}`);
        setTutor(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải hồ sơ gia sư:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  // ✅ Gửi yêu cầu học
  const handleSendRequest = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      alert("⚠️ Bạn cần đăng nhập để gửi yêu cầu học!");
      return;
    }

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api"
        }/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tutor_id: tutor.tutor_id,
            subject: tutor.subject || "Chưa xác định",
            message: "Tôi muốn học với gia sư này.",
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("✅ Đã gửi yêu cầu học thành công!");
        setIsRequested(true);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("🚨 Lỗi hệ thống: " + err.message);
    }
  };

  if (loading)
    return <p className="p-6 text-gray-500">⏳ Đang tải hồ sơ gia sư...</p>;
  if (!tutor)
    return <p className="p-6 text-red-500">❌ Không tìm thấy gia sư.</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        <TopbarStudent />

        {/* Thêm margin-top để không bị Topbar che */}
        <main className="flex-1 p-6 md:p-10 mt-[80px]">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 relative">
            {/* ===== Hàng ngang gồm mũi tên - avatar - nút gửi ===== */}
            <div className="flex flex-col md:flex-row items-center justify-between border-b pb-6 mb-6">
              {/* Mũi tên quay lại */}
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-blue-600 transition mb-4 md:mb-0"
                title="Quay lại"
              >
                <IoArrowBackOutline size={22} className="mr-1" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>

              {/* Ảnh đại diện + thông tin */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={tutor.avatar || "/avatars/default-tutor.png"}
                  alt="Tutor Avatar"
                  className="w-28 h-28 rounded-full object-cover border-2 border-blue-400 shadow-md"
                />
                <h2 className="text-2xl font-semibold text-gray-800 mt-3">
                  {tutor.full_name}
                </h2>
                <p className="text-sm text-gray-600">
                  ID:{" "}
                  <span className="font-medium text-green-600">
                    ND{String(tutor.tutor_id || 0).padStart(4, "0")}
                  </span>
                </p>
                <p className="text-yellow-500 text-sm mt-1">
                  ⭐ {tutor.rating || "5.0"} ({tutor.total_reviews || 0} đánh
                  giá)
                </p>
              </div>

              {/* Nút gửi yêu cầu học */}
              {isRequested ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg shadow mt-4 md:mt-0 cursor-not-allowed"
                >
                  ✅ Đã gửi yêu cầu
                </button>
              ) : (
                <button
                  onClick={handleSendRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition mt-4 md:mt-0"
                >
                  Gửi yêu cầu học
                </button>
              )}
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  📘 Thông tin người dạy
                </h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>
                    🎓 Trình độ: {tutor.education_level || "Chưa cập nhật"}
                  </li>
                  <li>📚 Chuyên ngành: {tutor.major || "Chưa cập nhật"}</li>
                  <li>
                    🏫 Trường theo học: {tutor.university || "Chưa cập nhật"}
                  </li>
                  <li>💼 Kinh nghiệm: {tutor.experience || "Chưa cập nhật"}</li>
                  <li>
                    💸 Học phí:{" "}
                    {tutor.hourly_rate
                      ? `${tutor.hourly_rate.toLocaleString()} đ/giờ`
                      : "Thoả thuận"}
                  </li>
                  <li>📖 Môn nhận dạy: {tutor.subject || "Chưa cập nhật"}</li>
                  <li>🏠 Khu vực: {tutor.city || "Chưa có địa chỉ"}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  🗺️ Địa chỉ và chứng chỉ
                </h3>
                <div className="w-full h-52 rounded-lg overflow-hidden border mb-2">
                  <VietnamMap
                    lat={tutor.lat || 10.75}
                    lng={tutor.lng || 106.65}
                    zoom={13}
                    singleMarker={{
                      avatar: tutor.avatar,
                      name: tutor.full_name,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-700">
                  🎓 Bằng cấp:{" "}
                  {tutor.degree_url ? (
                    <a
                      href={tutor.degree_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Xem chứng chỉ
                    </a>
                  ) : (
                    "Chưa có chứng chỉ."
                  )}
                </p>
              </div>
            </div>

            {/* Mô tả thêm */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📝 Mô tả thêm
              </h3>
              <p className="text-gray-700 text-sm bg-gray-50 border rounded-lg p-3">
                {tutor.bio || "Chưa có mô tả."}
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
