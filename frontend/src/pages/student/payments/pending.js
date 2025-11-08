import { useEffect, useState } from "react";
import api from "../../../utils/api";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import SidebarStudent from "../../../components/SidebarStudent";

export default function StudentPendingPayments() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/classes/payment/pending");
      if (res.data.success) setClasses(res.data.data);
    } catch (err) {
      console.error(" Lỗi tải danh sách lớp:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block w-64">
        <SidebarStudent />
      </div>

      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Danh sách lớp cần thanh toán
            </h2>

            {loading ? (
              <p className="text-gray-500 text-center py-10">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : classes.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                Không có lớp nào đang chờ thanh toán.
              </p>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.class_id}
                  className="mb-4 p-5 rounded-xl border shadow-sm bg-white hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">
                    Lớp: {cls.subject} - {cls.grade}
                  </h3>
                  <p className="text-gray-600">
                    Gia sư: {cls.tutor_name || "Chưa có gia sư"}
                  </p>
                  <p className="text-gray-600">
                    Học phí: {cls.tuition_amount?.toLocaleString()} VND
                  </p>
                  <p className="text-gray-600">
                    Trạng thái:{" "}
                    <span className="text-orange-500 font-medium">
                      ⏳ Đang chờ gia sư thanh toán
                    </span>
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
