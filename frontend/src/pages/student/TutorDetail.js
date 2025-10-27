import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import SidebarStudent from "../../components/SidebarStudent";
import Footer from "../../components/Footer";
import TopbarStudent from "../../components/TopbarStudent";
import dynamic from "next/dynamic";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";
import Link from "next/link";

const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

export default function TutorDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequested, setIsRequested] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [allTutors, setAllTutors] = useState([]);

  // 🔹 Lấy danh sách tất cả tutor để biết id kế tiếp
  useEffect(() => {
    const fetchAllTutors = async () => {
      try {
        const res = await api.get("/tutors");
        setAllTutors(res.data.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách gia sư:", err);
      }
    };
    fetchAllTutors();
  }, []);

  // 🔹 Lấy dữ liệu chi tiết tutor + lớp của học viên
  useEffect(() => {
    if (!id) return;

    const fetchTutor = async () => {
      try {
        const res = await api.get(`/tutors/${id}`);
        setTutor(res.data.data);
      } catch (err) {
        console.error("❌ Lỗi tải hồ sơ gia sư:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentClasses = async () => {
      try {
        const res = await api.get("/classes/mine");
        const all = res.data.data || [];
        const validClasses = all.filter((c) =>
          [
            "PENDING_ADMIN_APPROVAL",
            "APPROVED_VISIBLE",
            "ONGOING",
            "ACTIVE",
          ].includes(c.status)
        );
        setClasses(validClasses);
      } catch (err) {
        console.error("❌ Lỗi tải lớp học:", err);
      }
    };

    fetchTutor();
    fetchStudentClasses();
  }, [id]);

  // ✅ Kiểm tra xem lớp được chọn đã gửi yêu cầu chưa
  useEffect(() => {
    if (!id || !selectedClass) return;
    const checkRequest = async () => {
      try {
        const res = await api.get("/requests");
        const exists = res.data.data?.some(
          (r) =>
            r.tutor_id === Number(id) &&
            r.class_id === selectedClass.class_id &&
            r.status === "PENDING"
        );
        setIsRequested(exists);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra yêu cầu:", err);
      }
    };
    checkRequest();
  }, [id, selectedClass]);

  // ✅ Chuyển đến CV kế tiếp
  const handleNextTutor = () => {
    if (!tutor || allTutors.length === 0) return;

    const currentIndex = allTutors.findIndex(
      (t) => t.tutor_id === tutor.tutor_id
    );
    const nextIndex = (currentIndex + 1) % allTutors.length;
    const nextTutor = allTutors[nextIndex];

    if (nextTutor?.tutor_id) {
      router.push(`/student/TutorDetail?id=${nextTutor.tutor_id}`);
    }
  };

  // ✅ Gửi yêu cầu học
  const handleSendRequest = async () => {
    if (!selectedClass) {
      alert("⚠️ Vui lòng chọn lớp học bạn đã đăng!");
      return;
    }

    try {
      const payload = {
        class_id: selectedClass.class_id,
        tutor_id: tutor.tutor_id,
        subject: selectedClass.subject || tutor.subject || "Chưa xác định",
        message: `Tôi muốn mời gia sư ${tutor.full_name} dạy lớp ${selectedClass.class_id}.`,
      };

      const res = await api.post("/requests", payload);

      if (res.data.success) {
        alert("✅ Đã gửi yêu cầu học thành công!");
        setIsRequested(true);
      } else {
        alert("⚠️ " + (res.data.message || "Không gửi được yêu cầu!"));
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "🚨 Đã xảy ra lỗi, vui lòng thử lại sau.";
      if (msg.includes("Trùng lịch")) {
        alert("⏰ " + msg);
      } else if (msg.includes("3 yêu cầu")) {
        alert("⚠️ " + msg);
      } else {
        alert("❌ " + msg);
      }
    }
  };

  if (loading)
    return <p className="p-6 text-gray-500">⏳ Đang tải hồ sơ gia sư...</p>;
  if (!tutor)
    return <p className="p-6 text-red-500">❌ Không tìm thấy gia sư.</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <SidebarStudent />
      </div>

      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 md:p-10 mt-[80px]">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8 relative">
            {/* Header */}
            <div className="flex flex-col items-center border-b pb-6 mb-6 relative">
              {/* Quay lại */}
              <button
                onClick={() => router.back()}
                className="absolute left-6 top-6 flex items-center text-gray-600 hover:text-blue-600 transition"
              >
                <IoArrowBackOutline size={22} className="mr-1" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>

              {/* Mũi tên tới */}
              <button
                onClick={handleNextTutor}
                className="absolute right-6 top-6 flex items-center text-gray-600 hover:text-blue-600 transition"
                title="Xem gia sư kế tiếp"
              >
                <IoArrowForwardOutline size={22} />
                <span className="text-sm font-medium">Kế tiếp </span>
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <img
                  src={
                    tutor.avatar && tutor.avatar !== "null"
                      ? tutor.avatar
                      : "/default-avatar.png"
                  }
                  alt="Tutor Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg mx-auto"
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

                {isRequested ? (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg shadow mt-4 cursor-not-allowed"
                  >
                    ✅ Đã gửi yêu cầu
                  </button>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow mt-4 transition"
                  >
                    Gửi yêu cầu học
                  </button>
                )}
              </div>
            </div>

            {/* ✅ Chọn lớp học */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-l-4 border-orange-500 pl-2">
                🎯 Chọn lớp học bạn đã đăng
              </h3>

              {classes.length === 0 ? (
                <p className="text-gray-500 italic">
                  Bạn chưa có lớp học hợp lệ để gửi yêu cầu.{" "}
                  <Link
                    href="/dashboard/create-class"
                    className="text-blue-600 underline"
                  >
                    ➕ Tạo lớp mới
                  </Link>
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {classes.map((c) => (
                    <div
                      key={c.class_id}
                      onClick={() => setSelectedClass(c)}
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        selectedClass?.class_id === c.class_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-800">
                        🏷️ Mã lớp: {c.class_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        📘 Môn học: {c.subject}
                      </p>
                      <p className="text-sm text-gray-600">
                        💵 {c.tuition_amount?.toLocaleString()} đ/giờ
                      </p>
                      <p className="text-sm text-gray-600">
                        📍 {c.city || "Chưa rõ khu vực"}
                      </p>
                    </div>
                  ))}
                </div>
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
                  <li>🏫 Trường: {tutor.university || "Chưa cập nhật"}</li>
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
                  🗺️ Địa chỉ
                </h3>
                <div className="w-full h-52 rounded-lg overflow-hidden border mb-2">
                  <VietnamMap
                    lat={
                      !isNaN(parseFloat(tutor.lat))
                        ? parseFloat(tutor.lat)
                        : 10.75
                    }
                    lng={
                      !isNaN(parseFloat(tutor.lng))
                        ? parseFloat(tutor.lng)
                        : 106.65
                    }
                    zoom={13}
                    singleMarker={true}
                  />
                </div>
              </div>

              {/* Giới thiệu bản thân */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-1">
                  🧾 Giới thiệu bản thân
                </h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-md border">
                  {tutor.bio ||
                    "Gia sư chưa cập nhật phần giới thiệu bản thân."}
                </p>
              </div>

              {/* Chứng chỉ */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🎓 Chứng chỉ
                </h4>

                {tutor.certificates ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(Array.isArray(tutor.certificates)
                      ? tutor.certificates
                      : typeof tutor.certificates === "string"
                      ? tutor.certificates.split(",")
                      : []
                    )
                      .map((url, idx) => url.trim())
                      .filter((url) => url)
                      .map((url, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <img
                            src={
                              url.startsWith("http")
                                ? url
                                : `http://localhost:8080${url}`
                            }
                            alt={`Chứng chỉ ${idx + 1}`}
                            className="rounded-lg border shadow-sm w-full h-48 object-cover hover:scale-105 transition-transform"
                          />
                          <span className="text-xs text-gray-600 mt-1">
                            Chứng chỉ #{idx + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Chưa cập nhật chứng chỉ.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
