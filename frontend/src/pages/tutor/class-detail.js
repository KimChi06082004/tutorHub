import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import SidebarTutor from "../../components/SidebarTutor";
import TopbarTutor from "../../components/TopbarTutor";
import dynamic from "next/dynamic";

const MapBase = dynamic(() => import("../../components/MapBase"), {
  ssr: false,
});

export default function ClassDetailTutor() {
  const router = useRouter();
  const { id: classId } = router.query;

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false); // ✅ NEW

  /* =========================================================
     ⚙️ Lấy dữ liệu chi tiết lớp + lớp kế tiếp
  ========================================================= */
  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        const res = await api.get(`/classes/${classId}`);
        setClassData(res.data.data);
      } catch (err) {
        console.error("❌ Lỗi tải lớp:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkNext = async () => {
      try {
        await api.get(`/classes/next/${classId}`);
        setHasNext(true);
      } catch {
        setHasNext(false);
      }
    };

    // ✅ Kiểm tra gia sư đã gửi yêu cầu chưa
    const checkApplied = async () => {
      try {
        const res = await api.get(`/requests/check/${classId}`);
        if (res.data.applied) setHasApplied(true);
      } catch (err) {
        console.error("❌ Lỗi kiểm tra ứng tuyển:", err);
      }
    };

    fetchClass();
    checkNext();
    checkApplied();
  }, [classId]);

  if (loading)
    return <p className="text-center mt-10">⏳ Đang tải dữ liệu...</p>;
  if (!classData)
    return (
      <p className="text-center mt-10 text-red-500">Không tìm thấy lớp.</p>
    );

  const {
    full_name,
    avatar,
    subject,
    grade,
    tuition_amount,
    schedule,
    city,
    ward,
    lat,
    lng,
    student_id,
    teacher_gender,
    age_range,
    education_level,
    experience,
    description,
  } = classData;

  const safeLat = lat || 10.7769;
  const safeLng = lng || 106.7009;

  /* =========================================================
     📨 GỬI YÊU CẦU ỨNG TUYỂN DẠY
  ========================================================= */
  const handleApply = async () => {
    if (hasApplied || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      class_id: classId,
      message: message || "Tôi muốn ứng tuyển lớp này.",
    };

    try {
      const res = await api.post("/requests/apply", payload).catch((err) => {
        throw err.response || err;
      });

      if (res?.data?.success) {
        alert("✅ Đã gửi yêu cầu dạy lớp thành công!");
        setHasApplied(true); // ✅ Đánh dấu đã gửi
        return;
      }

      const msg = res?.data?.message || "⚠️ Gửi yêu cầu thất bại!";
      console.warn("⚠️ Thông báo backend:", msg);

      if (msg.includes("ứng tuyển lớp này rồi")) {
        setHasApplied(true);
        alert("❌ Bạn đã ứng tuyển lớp này rồi!");
        return;
      }

      if (
        msg.includes("hồ sơ") ||
        msg.includes("CV") ||
        msg.includes("duyệt hồ sơ")
      ) {
        alert("⚠️ Bạn cần hoàn thiện hồ sơ trước khi ứng tuyển lớp!");
        await router.push("/tutor/update-cv");
        return;
      }

      alert(`⚠️ ${msg}`);
    } catch (error) {
      console.error("❌ Lỗi gửi yêu cầu:", error);
      alert("❌ Không thể gửi yêu cầu dạy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     🎨 Giao diện trang chi tiết lớp
  ========================================================= */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarTutor />
      <div className="flex-1">
        <TopbarTutor />
        <div className="mt-20" />

        {/* ================= HEADER ================= */}
        <div className="bg-white py-6 relative shadow-sm rounded-b-xl border-b border-gray-200">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 relative">
            <button
              onClick={() => router.back()}
              className="absolute left-0 lg:left-10 bg-white hover:bg-gray-100 text-gray-700 shadow-sm rounded-full w-10 h-10 flex items-center justify-center border border-gray-300"
            >
              ⬅
            </button>

            {/* Thông tin học viên */}
            <div className="flex flex-col items-center mx-auto">
              <img
                src={
                  avatar && avatar !== "null" ? avatar : "/default-avatar.png"
                }
                alt="Avatar học viên"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
              />
              <h2 className="font-semibold mt-3 text-gray-800 text-lg">
                {full_name}
              </h2>
              <div className="text-sm text-gray-500 mt-1">
                <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full font-medium">
                  ID: HV{student_id}
                </span>
              </div>
              <div className="flex items-center mt-1 text-yellow-500 text-sm">
                {"★★★★★"} <span className="ml-1 text-gray-400">(0)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Truy cập gần đây</p>
            </div>

            {/* Nút chuyển lớp kế tiếp */}
            <button
              disabled={!hasNext}
              onClick={async () => {
                try {
                  const res = await api.get(`/classes/next/${classId}`);
                  const nextClass = res.data?.data;
                  if (nextClass?.class_id) {
                    router.push(`/tutor/class-detail?id=${nextClass.class_id}`);
                  } else {
                    setHasNext(false);
                  }
                } catch (err) {
                  if (err.response?.status === 404) setHasNext(false);
                  else console.error("❌ Lỗi lấy lớp kế tiếp:", err);
                }
              }}
              className={`${
                hasNext
                  ? "bg-white hover:bg-gray-100 text-gray-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } shadow-sm rounded-full w-10 h-10 flex items-center justify-center border border-gray-300`}
            >
              ➡
            </button>
          </div>
        </div>

        {/* ================= NỘI DUNG ================= */}
        <div className="max-w-5xl mx-auto p-6">
          {/* ====== YÊU CẦU TUYỂN CHỌN ====== */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-l-4 border-orange-400 pl-3">
              Yêu cầu tuyển chọn - Lớp dạy tại nhà
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700 mb-4">
              <p>
                <b>Giới tính:</b> {teacher_gender || "Không yêu cầu"}
              </p>
              <p>
                <b>Độ tuổi:</b> {age_range || "Không giới hạn"}
              </p>
              <p>
                <b>Trình độ:</b> {education_level || "Không yêu cầu"}
              </p>
              <p>
                <b>Kinh nghiệm:</b> {experience || "Không yêu cầu"}
              </p>
              <p className="col-span-2">
                <b>Môn dạy:</b> {subject || "Chưa cập nhật"}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg text-gray-700 mb-5 leading-relaxed">
              <b>Mô tả:</b>{" "}
              {description ||
                "Chưa có mô tả cụ thể về yêu cầu của học viên đối với gia sư."}
            </div>

            <div className="bg-orange-500 text-white font-semibold rounded-lg flex justify-between items-center p-4 text-lg shadow-md">
              <span>Học phí ứng tuyển</span>
              <span>
                {tuition_amount
                  ? tuition_amount.toLocaleString() + " đ / Giờ"
                  : "Thoả thuận"}
              </span>
            </div>
          </div>

          {/* ====== ĐỊA CHỈ LỚP ====== */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              Địa chỉ lớp
            </h3>
            <p className="text-gray-800 mb-3 font-medium">
              {[ward, city].filter(Boolean).join(", ")}
            </p>
            <div className="h-[320px] rounded-xl overflow-hidden border border-gray-200">
              <MapBase center={{ lat: safeLat, lng: safeLng }} zoom={14} />
            </div>
          </div>

          {/* ====== LỊCH HỌC ====== */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              Lịch học
            </h3>
            <p className="text-gray-600 mb-4">
              {schedule
                ? (() => {
                    try {
                      const s =
                        typeof schedule === "string"
                          ? JSON.parse(schedule)
                          : schedule;
                      const time = `${s.timeRange?.from || "?"} - ${
                        s.timeRange?.to || "?"
                      }`;
                      return (
                        <>
                          <b>Giờ học:</b> {time}
                        </>
                      );
                    } catch {
                      return <b>{schedule}</b>;
                    }
                  })()
                : "Chưa có thông tin lịch học"}
            </p>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {(() => {
                let activeDays = [];
                try {
                  const s =
                    typeof schedule === "string"
                      ? JSON.parse(schedule)
                      : schedule;
                  activeDays = s.days || [];
                } catch {}
                const allDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
                return allDays.map((day, i) => {
                  const isActive = activeDays.includes(day);
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg font-medium border ${
                        isActive
                          ? "bg-blue-100 border-blue-400 text-blue-700"
                          : "bg-gray-100 border-gray-200 text-gray-500"
                      }`}
                    >
                      {day}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* ====== NÚT ỨNG TUYỂN ====== */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập lời nhắn cho học viên (tuỳ chọn)..."
              className="w-full max-w-lg border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleApply}
              disabled={isSubmitting || hasApplied}
              className={`${
                hasApplied
                  ? "bg-gray-400 cursor-not-allowed"
                  : isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              } text-white font-semibold px-8 py-3 rounded-lg shadow-md transition`}
            >
              {hasApplied
                ? "✅ Đã gửi yêu cầu"
                : isSubmitting
                ? "⏳ Đang gửi..."
                : "📩 Gửi yêu cầu dạy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
