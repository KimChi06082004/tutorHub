import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import StepProgress from "./components/StepProgress";
import FormNavButtons from "./components/FormNavButtons";
import api from "../../../utils/api";

export default function Step4() {
  const router = useRouter();
  const [weeks, setWeeks] = useState(3);
  const [days, setDays] = useState([]);
  const [timeRange, setTimeRange] = useState({ from: "18:00", to: "20:00" });
  const [loading, setLoading] = useState(false);

  const [step3Data, setStep3Data] = useState(null); // ✅ hiển thị địa chỉ

  // ✅ Load lại dữ liệu Step4 khi quay lại
  useEffect(() => {
    const saved4 = localStorage.getItem("classStep4");
    if (saved4) {
      try {
        const parsed = JSON.parse(saved4);
        setWeeks(parsed.weeks || 3);
        setDays(parsed.days || []);
        setTimeRange(parsed.timeRange || { from: "18:00", to: "20:00" });
      } catch (err) {
        console.warn("⚠️ Parse Step4 data error:", err);
      }
    }

    // ✅ Load dữ liệu Step3 để hiển thị xác nhận khu vực học
    const saved3 = localStorage.getItem("classStep3");
    if (saved3) {
      try {
        const parsed = JSON.parse(saved3);
        setStep3Data(parsed);
      } catch (err) {
        console.warn("⚠️ Parse Step3 data error:", err);
      }
    }
  }, []);

  // ✅ Tự động lưu mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem(
      "classStep4",
      JSON.stringify({ weeks, days, timeRange })
    );
  }, [weeks, days, timeRange]);

  // ✅ Chuyển bước trước
  const prevStep = () => {
    localStorage.setItem(
      "classStep4",
      JSON.stringify({ weeks, days, timeRange })
    );
    router.push("/dashboard/create-class/Step3");
  };

  // ✅ Gửi dữ liệu lên server
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Lưu lại dữ liệu hiện tại
      localStorage.setItem(
        "classStep4",
        JSON.stringify({ weeks, days, timeRange })
      );

      // Lấy dữ liệu từ các bước trước
      const step1 = JSON.parse(localStorage.getItem("classStep1") || "{}");
      const step2 = JSON.parse(localStorage.getItem("classStep2") || "{}");
      const step3 = JSON.parse(localStorage.getItem("classStep3") || "{}");

      // Kiểm tra dữ liệu bắt buộc
      if (!step1.subject || !step1.grade) {
        alert("⚠️ Thiếu thông tin môn học hoặc lớp học!");
        setLoading(false);
        return;
      }

      // Chuẩn bị payload
      const payload = {
        subject: step1.subject,
        grade: step1.grade,
        tuition_amount: Number(step2.fee) || 0,
        schedule: { weeks, days, timeRange },
        lat: Number(step3.lat) || 10.762622,
        lng: Number(step3.lng) || 106.660172,
        city: step3.city || "Hồ Chí Minh",
        district: step3.district || "",
        ward: step3.ward || "",
        address: step3.address || "",
      };

      console.log("📦 Payload gửi backend:", payload);

      const res = await api.post("/classes", payload);
      alert(res.data.message || "✅ Đăng lớp thành công!");

      // Xoá dữ liệu tạm
      ["classStep1", "classStep2", "classStep3", "classStep4"].forEach((k) =>
        localStorage.removeItem(k)
      );

      router.push("/dashboard/student");
    } catch (err) {
      console.error("❌ Lỗi tạo lớp:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      } else {
        alert("Không thể tạo lớp. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <StepProgress current={4} />

            <h2 className="text-2xl font-semibold mb-6">🕒 Chọn lịch học</h2>

            {/* ✅ Hiển thị địa chỉ xác nhận từ Step3 */}
            {step3Data && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
                <p className="font-semibold mb-1">📍 Khu vực dạy:</p>
                <p>
                  {[
                    step3Data.address,
                    step3Data.ward,
                    step3Data.district,
                    step3Data.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Chọn số tuần */}
            <div className="mb-6">
              <label className="font-semibold">Số tuần học:</label>
              <div className="flex gap-4 mt-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeeks(w)}
                    className={`px-4 py-2 border rounded-lg ${
                      weeks === w
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {w} tuần
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn ngày học */}
            <div className="mb-6">
              <label className="font-semibold">Ngày học trong tuần:</label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={days.includes(d)}
                      onChange={() =>
                        setDays((prev) =>
                          prev.includes(d)
                            ? prev.filter((x) => x !== d)
                            : [...prev, d]
                        )
                      }
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn thời gian */}
            <div className="mb-6">
              <label className="font-semibold">Thời gian học:</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="time"
                  value={timeRange.from}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, from: e.target.value })
                  }
                  className="border p-2 rounded-lg"
                />
                <span>-</span>
                <input
                  type="time"
                  value={timeRange.to}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, to: e.target.value })
                  }
                  className="border p-2 rounded-lg"
                />
              </div>
            </div>

            <FormNavButtons
              onPrev={prevStep}
              onNext={handleSubmit}
              nextText={loading ? "Đang đăng..." : "✅ Đăng lớp"}
            />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
