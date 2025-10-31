import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../utils/api";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import CalendarView from "../../../components/CalendarView";
import SidebarStudent from "../../../components/SidebarStudent";

export default function StudentCompletedClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/classes/student/completed");
      if (res.data.success) setClasses(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi tải lớp đã kết thúc:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarStudent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopbarStudent />

        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">
              🏁 Lớp đã kết thúc
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* --- Cột bên trái: Danh sách lớp --- */}
              <div className="flex-1">
                {loading ? (
                  <p className="text-gray-500 text-center py-10">
                    ⏳ Đang tải dữ liệu...
                  </p>
                ) : classes.length === 0 ? (
                  <p className="text-gray-500 italic text-center">
                    Bạn chưa có lớp nào đã kết thúc.
                  </p>
                ) : (
                  classes.map((cls) => (
                    <div
                      key={cls.class_id}
                      onClick={() => setSelectedClass(cls)}
                      className={`mb-4 p-5 rounded-2xl border shadow-md cursor-pointer transition ${
                        selectedClass?.class_id === cls.class_id
                          ? "border-blue-500 bg-blue-50"
                          : "bg-white hover:shadow-lg"
                      }`}
                    >
                      <h3 className="font-bold text-blue-800 text-lg">
                        {cls.subject} - Lớp {cls.grade}
                      </h3>
                      <p className="text-sm text-gray-600">
                        👨‍🏫 Gia sư: {cls.tutor_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        📧 {cls.tutor_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        🏠 Địa chỉ: {cls.address || "Chưa có thông tin"}
                      </p>
                      <p className="text-sm text-gray-500">
                        💰 Học phí: {cls.tuition_amount?.toLocaleString() || 0}{" "}
                        VND/h
                      </p>
                      <p className="text-sm text-gray-500">
                        🕒 Ngày hoàn thành:{" "}
                        <b>
                          {cls.completed_at
                            ? new Date(cls.completed_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : "-"}
                        </b>
                      </p>
                      <p className="mt-2 text-green-600 font-medium">
                        ✅ Trạng thái: Lớp đã hoàn tất
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* --- Cột bên phải: Chi tiết lớp --- */}
              <div className="flex-1">
                {selectedClass ? (
                  <div className="p-6 rounded-2xl border bg-white shadow-md">
                    <h3 className="text-xl font-semibold text-blue-700 mb-3">
                      🧾 Chi tiết lớp TN{selectedClass.class_id}
                    </h3>

                    <div className="space-y-2 text-gray-700">
                      <p>
                        📘 <b>Môn học:</b> {selectedClass.subject}
                      </p>
                      <p>
                        🏫 <b>Khối lớp:</b> Lớp {selectedClass.grade}
                      </p>
                      <p>
                        👨‍🏫 <b>Gia sư:</b> {selectedClass.tutor_name}
                      </p>
                      <p>
                        ✉️ <b>Email gia sư:</b>{" "}
                        <span className="text-blue-600">
                          {selectedClass.tutor_email}
                        </span>
                      </p>
                      <p>
                        🏠 <b>Địa chỉ:</b>{" "}
                        {selectedClass.address || "Chưa có thông tin"}
                      </p>
                      <p>
                        💰 <b>Học phí:</b>{" "}
                        {selectedClass.tuition_amount?.toLocaleString()} VND/h
                      </p>
                      <p>
                        📅 <b>Ngày hoàn thành:</b>{" "}
                        {selectedClass.completed_at
                          ? new Date(
                              selectedClass.completed_at
                            ).toLocaleDateString("vi-VN")
                          : "-"}
                      </p>
                    </div>

                    {/* --- Lịch học --- */}
                    <div className="mt-5 border-t pt-3">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        🗓️ Thời khóa biểu (Lịch học)
                      </h4>
                      <CalendarView
                        schedule={JSON.parse(selectedClass.schedule || "{}")}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 italic">
                    👉 Chọn một lớp để xem chi tiết
                  </div>
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
