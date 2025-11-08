import { useEffect, useState } from "react";
import api from "../../../utils/api";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import CalendarView from "../../../components/CalendarView";
import SidebarStudent from "../../../components/SidebarStudent";

export default function StudentActiveClasses() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveClasses();
  }, []);

  const fetchActiveClasses = async () => {
    try {
      const res = await api.get("/classes/student/active");
      if (res.data.success) setClasses(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi tải lớp đang học:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center p-10 text-gray-500">⏳ Đang tải...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarStudent />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        <TopbarStudent />

        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
            {/* --- Cột trái: Danh sách lớp --- */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                Lớp đang học
              </h2>

              {classes.length === 0 ? (
                <p className="text-gray-500 italic">
                  Bạn chưa có lớp đang học.
                </p>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls.class_id}
                    onClick={() => setSelected(cls)}
                    className={`cursor-pointer mb-4 p-5 rounded-2xl border shadow-md transition ${
                      selected?.class_id === cls.class_id
                        ? "border-blue-500 bg-blue-50"
                        : "bg-white hover:shadow-lg border-gray-200"
                    }`}
                  >
                    <h3 className="font-bold text-blue-800 text-lg">
                      {cls.subject} - Lớp {cls.grade}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Gia sư: {cls.tutor_name}
                    </p>
                    <p className="text-sm text-gray-600">{cls.tutor_email}</p>
                    <p className="text-sm text-gray-500">
                      Địa chỉ: {cls.address || "Chưa có thông tin"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Trạng thái:{" "}
                      <b className="text-green-600">Đã thanh toán | Đang học</b>
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày bắt đầu:{" "}
                      <b>
                        {cls.start_date
                          ? new Date(cls.start_date).toLocaleDateString("vi-VN")
                          : "-"}
                      </b>
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày kết thúc:{" "}
                      <b>
                        {cls.end_date
                          ? new Date(cls.end_date).toLocaleDateString("vi-VN")
                          : "-"}
                      </b>
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* --- Cột phải: Chi tiết lớp --- */}
            <div>
              {selected ? (
                <div className="bg-white rounded-2xl p-6 shadow-md border">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">
                    Chi tiết lớp TN{selected.class_id}
                  </h2>

                  <p>
                    <b>Môn học:</b> {selected.subject}
                  </p>
                  <p>
                    <b>Khối lớp:</b> {selected.grade}
                  </p>
                  <p>
                    <b>Gia sư:</b> {selected.tutor_name}
                  </p>
                  <p>
                    <b>Email gia sư:</b>{" "}
                    <span className="text-blue-700">
                      {selected.tutor_email}
                    </span>
                  </p>

                  <hr className="my-3" />

                  <h3 className="font-medium mb-2 text-gray-700">
                    Thời khóa biểu (Lịch học)
                  </h3>

                  <CalendarView
                    schedule={
                      typeof selected.schedule === "string"
                        ? JSON.parse(selected.schedule)
                        : selected.schedule
                    }
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-10">
                  Chọn một lớp để xem chi tiết
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
