import { useEffect, useState } from "react";
import api from "../../../utils/api";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";
import Footer from "../../../components/Footer";

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
      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="p-8 mt-[70px]">
          <h2 className="text-2xl font-semibold mb-6 text-green-700">
            💰 Danh sách lớp đã thanh toán
          </h2>

          {classes.length === 0 ? (
            <p className="text-gray-500 italic">
              Chưa có lớp nào được thanh toán.
            </p>
          ) : (
            classes.map((c) => (
              <div
                key={c.class_id}
                className="p-5 bg-white rounded-2xl shadow mb-4 border border-green-200"
              >
                <h3 className="font-semibold text-lg text-green-700">
                  Lớp: TN{c.class_id}
                </h3>
                <p>📘 Môn: {c.subject}</p>
                <p>
                  💸 Học phí: {Number(c.tuition_amount * 1000).toLocaleString()}{" "}
                  VNĐ
                </p>
                <p>🗓️ Trạng thái: Đã thanh toán</p>
              </div>
            ))
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
