// frontend/src/pages/admin/TutorDetail.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import TopbarTutor from "../../components/TopbarTutor";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TutorDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Gọi API lấy chi tiết hồ sơ
  useEffect(() => {
    if (!id) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken")
        : null;

    fetch(`${API_BASE}/tutors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTutor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch tutor error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center mt-20">⏳ Đang tải hồ sơ...</p>;
  if (!tutor)
    return <p className="text-center mt-20">❌ Không tìm thấy hồ sơ!</p>;

  // ✅ Xử lý chứng chỉ dạng JSON string
  let certList = [];
  try {
    certList = JSON.parse(tutor.certificates || "[]");
  } catch {
    certList = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopbarTutor />

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
        <button
          onClick={() => router.back()}
          className="mb-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ◀ Quay lại
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          🧾 Chi tiết hồ sơ gia sư #{tutor.tutor_id}
        </h2>

        {/* Thông tin cá nhân */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="w-36 h-36 rounded-full overflow-hidden border border-blue-300 shadow-md">
              <img
                src={tutor.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 font-semibold text-lg text-gray-800">
              {tutor.full_name}
            </p>
            <p className="text-gray-500 text-sm">
              {tutor.education_level} – {tutor.major}
            </p>
            <p className="text-gray-500 text-sm">{tutor.university}</p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <strong>Ngày sinh:</strong>{" "}
              {tutor.birth_date
                ? new Date(tutor.birth_date).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-white ${
                  tutor.status === "PENDING"
                    ? "bg-yellow-500"
                    : tutor.status === "APPROVED"
                    ? "bg-green-600"
                    : "bg-red-500"
                }`}
              >
                {tutor.status}
              </span>
            </div>
            <div className="sm:col-span-2">
              <strong>Giới thiệu:</strong>
              <p className="border rounded-md p-3 mt-2 bg-gray-50">
                {tutor.bio || "Chưa có mô tả"}
              </p>
            </div>
          </div>
        </div>

        {/* CCCD */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            🪪 Ảnh CCCD
          </h3>
          <div className="flex gap-6 flex-wrap">
            {[tutor.cccd_front, tutor.cccd_back].map(
              (img, idx) =>
                img && (
                  <div
                    key={idx}
                    className="w-48 h-32 border rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`CCCD ${idx === 0 ? "Trước" : "Sau"}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
            )}
          </div>
        </div>

        {/* Chứng chỉ */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            🎓 Chứng chỉ / Bằng cấp
          </h3>
          {certList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certList.map((url, i) => (
                <div
                  key={i}
                  className="w-40 h-40 rounded-lg border overflow-hidden shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Certificate ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có chứng chỉ.</p>
          )}
        </div>

        {/* Thông tin học vấn và kinh nghiệm */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            📚 Học vấn & Kinh nghiệm
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <strong>Trường:</strong> {tutor.university || "—"}
            </div>
            <div>
              <strong>Ngành học:</strong> {tutor.major || "—"}
            </div>
            <div className="sm:col-span-2">
              <strong>Kinh nghiệm:</strong>
              <p className="border rounded-md p-3 mt-2 bg-gray-50">
                {tutor.experience || "Chưa có"}
              </p>
            </div>
          </div>
        </div>

        {/* Thao tác duyệt */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={() =>
              fetch(`${API_BASE}/tutors/${tutor.tutor_id}/approve`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    localStorage.getItem("accessToken") ||
                    localStorage.getItem("token")
                  }`,
                },
                body: JSON.stringify({ status: "APPROVED" }),
              }).then(() => {
                alert("✅ Đã duyệt hồ sơ!");
                router.push("/dashboard/admin");
              })
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            ✅ Duyệt hồ sơ
          </button>

          <button
            onClick={() =>
              fetch(`${API_BASE}/tutors/${tutor.tutor_id}/approve`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    localStorage.getItem("accessToken") ||
                    localStorage.getItem("token")
                  }`,
                },
                body: JSON.stringify({ status: "REJECTED" }),
              }).then(() => {
                alert("❌ Hồ sơ đã bị từ chối!");
                router.push("/dashboard/admin");
              })
            }
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            ❌ Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
