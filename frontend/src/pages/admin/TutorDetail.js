// frontend/src/pages/admin/TutorDetail.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TopbarAdmin from "../../components/TopbarAdmin";
import dynamic from "next/dynamic";

const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TutorDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!id || !token) return;
    fetch(`${API_BASE}/tutors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTutor(data.data);
        else alert(" Không tìm thấy hồ sơ!");
      })
      .catch((err) => console.error("Fetch tutor error:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleAction = async (action) => {
    if (action === "reject" && !reason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    const endpoint =
      action === "approve" ? `/tutors/${id}/approve` : `/tutors/${id}/reject`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: action === "reject" ? JSON.stringify({ reason }) : null,
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        router.push("/dashboard/admin");
      } else {
        alert(" " + (data.message || "Thao tác thất bại!"));
      }
    } catch (err) {
      alert(" Lỗi server!");
    }
  };

  if (loading) return <p className="text-center mt-20">⏳ Đang tải hồ sơ...</p>;
  if (!tutor)
    return (
      <p className="text-center mt-20 text-red-500"> Không tìm thấy hồ sơ!</p>
    );

  // ✅ Parse chứng chỉ JSON
  let certList = [];
  try {
    certList = Array.isArray(tutor.certificates)
      ? tutor.certificates
      : JSON.parse(tutor.certificates || "[]");
  } catch {
    certList = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopbarAdmin />

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
        <button
          onClick={() => router.back()}
          className="mb-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ◀ Quay lại
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Hồ sơ chi tiết của {tutor.full_name}
        </h2>

        {/* 1️⃣ Thông tin cơ bản */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <img
              src={tutor.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-36 h-36 rounded-full object-cover border shadow-md"
            />
            <p className="mt-3 font-semibold text-lg text-gray-800">
              {tutor.full_name}
            </p>
            <p className="text-gray-500 text-sm">
              {tutor.education_level} – {tutor.major}
            </p>
            <p className="text-gray-500 text-sm">{tutor.university}</p>
            <span
              className={`mt-2 px-2 py-1 rounded text-white text-xs ${
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

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <div>
              <strong>Ngày sinh:</strong>{" "}
              {tutor.birth_date
                ? new Date(tutor.birth_date).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </div>
            <div>
              <strong>Giới tính:</strong> {tutor.gender || "—"}
            </div>
            <div>
              <strong>Thành phố:</strong> {tutor.city || "—"}
            </div>
            <div>
              <strong>Học phí:</strong>{" "}
              {tutor.hourly_rate
                ? `${tutor.hourly_rate.toLocaleString()} đ/giờ`
                : "Thoả thuận"}
            </div>
            <div className="sm:col-span-2">
              <strong>Môn nhận dạy:</strong> {tutor.subject || "Chưa cập nhật"}
            </div>
          </div>
        </div>

        {/* 2️⃣ Mô tả thêm */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Giới thiệu & Kinh nghiệm
          </h3>
          <p className="border rounded-md p-3 bg-gray-50 text-sm">
            {tutor.bio || tutor.experience || "Chưa có mô tả."}
          </p>
        </div>

        {/* 3️⃣ Ảnh CCCD */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Ảnh CCCD</h3>
          <div className="flex gap-6 flex-wrap">
            {[tutor.cccd_front, tutor.cccd_back].map(
              (img, i) =>
                img && (
                  <img
                    key={i}
                    src={img}
                    alt={`CCCD ${i === 0 ? "Trước" : "Sau"}`}
                    className="w-48 h-32 object-cover rounded-lg border"
                  />
                )
            )}
          </div>
        </div>

        {/* 4️⃣ Chứng chỉ */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Chứng chỉ / Bằng cấp
          </h3>
          {certList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certList.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Chứng chỉ ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg border"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có chứng chỉ.</p>
          )}
        </div>

        {/* 5️⃣ Bản đồ */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Vị trí dạy
          </h3>
          <div className="w-full h-64 rounded-lg overflow-hidden border">
            <VietnamMap
              lat={tutor.lat || 10.762622}
              lng={tutor.lng || 106.660172}
              zoom={13}
              singleMarker
            />
          </div>
        </div>

        {/* 6️⃣ Thao tác duyệt */}
        <div className="mt-10 border-t pt-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối (nếu có)..."
            className="w-full border rounded-md p-3 mb-4 text-sm"
            rows={3}
          ></textarea>

          <div className="flex gap-4">
            <button
              onClick={() => handleAction("approve")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Duyệt hồ sơ
            </button>

            <button
              onClick={() => handleAction("reject")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Từ chối hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
