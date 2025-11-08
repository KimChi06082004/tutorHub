import { useEffect, useState } from "react";
import api from "../../../utils/api";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";

export default function TutorCompletedClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/classes/tutor/completed");
      if (res.data.success) setClasses(res.data.data);
    } catch (err) {
      console.error(" Lỗi tải lớp đã kết thúc:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block w-64">
        <SidebarTutor />
      </div>

      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">
              Lớp đã kết thúc
            </h2>

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
                  className="mb-4 p-5 rounded-2xl border shadow-md bg-white transition hover:shadow-lg"
                >
                  <h3 className="font-bold text-blue-800 text-lg">
                    {cls.subject} - Lớp {cls.grade}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Học viên: {cls.student_name}
                  </p>
                  <p className="text-sm text-gray-600">{cls.student_email}</p>
                  <p className="text-sm text-gray-600">
                    Địa chỉ: {cls.address || "Chưa có thông tin"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Học phí: {cls.tuition_amount?.toLocaleString()} VND/h
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày hoàn thành:{" "}
                    <b>
                      {cls.completed_at
                        ? new Date(cls.completed_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </b>
                  </p>
                  <p className="mt-2 text-green-600 font-medium">
                    Trạng thái: Lớp đã hoàn tất
                  </p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
