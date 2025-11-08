import { useEffect, useState } from "react";
import api from "../../../utils/api";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";

export default function TutorPaid() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchPaid = async () => {
      const res = await api.get("/classes/payment/paid");
      if (res.data.success) setClasses(res.data.data);
    };
    fetchPaid();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarTutor />

      {/* ✅ Thêm margin-left để tránh bị sidebar che */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <TopbarTutor />

        <main className="p-8 mt-[70px]">
          <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
            Danh sách lớp đã thanh toán
          </h2>

          {classes.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-gray-500 italic">
                Hiện chưa có lớp nào được thanh toán.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((c) => (
                <div
                  key={c.class_id}
                  className="relative bg-white rounded-2xl shadow-md border border-green-200 hover:shadow-lg transition-shadow duration-300 p-5"
                >
                  <div className="absolute top-3 right-3 text-green-700 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                    Đã thanh toán
                  </div>

                  <h3 className="font-semibold text-lg text-green-700 mb-2">
                    Lớp TN{c.class_id}
                  </h3>
                  <p className="text-gray-700"> Môn: {c.subject}</p>
                  <p className="text-gray-700">
                    Học phí:{" "}
                    <span className="font-semibold text-green-700">
                      {Number(c.tuition_amount * 1000).toLocaleString()} VNĐ
                    </span>
                  </p>
                  <p className="text-gray-700">
                    Trạng thái:{" "}
                    <span className="text-green-600">Đã thanh toán</span>
                  </p>

                  <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Thanh toán qua:{" "}
                      <span className="font-medium text-gray-700">
                        {c.payment_method || "Chuyển khoản"}
                      </span>
                    </p>
                    {/* <button
                      onClick={() => alert(`Xem chi tiết lớp TN${c.class_id}`)}
                      className="text-green-700 text-sm font-semibold hover:underline"
                    >
                      Xem chi tiết →
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
