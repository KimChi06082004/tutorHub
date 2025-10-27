import { useEffect, useState } from "react";
import api from "../../../utils/api";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";
import Footer from "../../../components/Footer";

export default function CancelledPayments() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCancelled = async () => {
      try {
        const res = await api.get("/classes/payment/cancelled");
        if (res.data.success) setClasses(res.data.data || []);
        else setClasses([]);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCancelled();
  }, []);

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500">
        ⏳ Đang tải danh sách lớp đã hủy thanh toán...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarTutor />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              ❌ Danh sách lớp đã hủy hoặc hết hạn thanh toán
            </h2>

            {classes.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                Không có lớp nào bị hủy hoặc hết hạn thanh toán.
              </p>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => {
                  const total =
                    (cls.tuition_amount || 0) *
                    (cls.sessions_per_week || 1) *
                    (cls.weeks || 1);
                  const reason =
                    cls.payment_status === "PAYMENT_CANCELLED"
                      ? "Gia sư đã hủy thanh toán"
                      : "Hết thời hạn thanh toán";

                  return (
                    <div
                      key={cls.class_id}
                      className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-blue-700">
                            Học tại nhà - TN{cls.class_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Môn học: {cls.subject} | Lớp:{" "}
                            {cls.grade || "Không rõ"}
                          </p>
                          <p className="text-sm text-gray-600">
                            💵 Học phí gốc:{" "}
                            {Number(total * 1000).toLocaleString("vi-VN")} VNĐ
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ Lý do: {reason}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            cls.payment_status === "EXPIRED"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {cls.payment_status === "EXPIRED"
                            ? "Hết hạn"
                            : "Đã hủy"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
