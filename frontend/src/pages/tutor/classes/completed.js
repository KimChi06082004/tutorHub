import { useEffect, useState } from "react";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";
import Footer from "../../../components/Footer";
import api from "../../../utils/api";

export default function CompletedClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await api.get("/classes/tutor/completed");
        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error("❌ Lỗi tải lớp đã kết thúc:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompleted();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 py-10">
        ⏳ Đang tải danh sách lớp đã kết thúc...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block w-64">
        <SidebarTutor />
      </div>

      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">
              🏁 Lớp học đã kết thúc
            </h2>

            {classes.length === 0 ? (
              <div className="text-gray-500 italic text-center">
                Hiện bạn chưa có lớp nào đã kết thúc.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div
                    key={cls.class_id}
                    className="p-5 rounded-xl shadow bg-white border border-gray-200 hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold text-blue-800">
                      {cls.subject} - {cls.grade}
                    </h3>
                    <p className="text-sm text-gray-600">
                      🏠 {cls.address || "Không có địa chỉ"}
                    </p>
                    <p className="text-sm text-gray-600">
                      👩‍🎓 Học viên: {cls.student_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      💰 Học phí: {cls.tuition_amount?.toLocaleString()} VND
                    </p>
                    <p className="text-sm text-gray-500">
                      ⏰ Hoàn tất:{" "}
                      {cls.completed_at
                        ? new Date(cls.completed_at).toLocaleDateString("vi-VN")
                        : "Chưa xác định"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
