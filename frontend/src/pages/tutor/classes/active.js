import { useEffect, useState } from "react";
import api from "../../../utils/api";
import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";
import Footer from "../../../components/Footer";

export default function ActiveClasses() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0); // Tuần hiện tại trong lịch

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/classes/tutor/active");
        if (res.data.success) setClasses(res.data.data);
      } catch (err) {
        console.error(" Lỗi tải danh sách lớp đang dạy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const translateStatus = (payment, status) => {
    const paymentText =
      payment === "PAID"
        ? "Đã thanh toán"
        : payment === "PENDING_PAYMENT"
        ? "Chờ thanh toán"
        : "Khác";
    const statusText =
      status === "APPROVED_VISIBLE"
        ? "Đang dạy"
        : status === "DONE"
        ? "Đã hoàn tất"
        : status === "CANCELLED"
        ? "Đã hủy"
        : "Khác";
    return `${paymentText} | ${statusText}`;
  };

  // 📆 Sinh toàn bộ ngày học thật sự (ví dụ 3 tuần, thứ 6, 18h-20h)
  const generateRealDates = (startDate, weeks, days) => {
    const mapDay = { T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6, CN: 0 };
    const list = [];
    const start = new Date(startDate);

    for (let w = 0; w < weeks; w++) {
      for (const d of days) {
        const targetDay = mapDay[d];
        const newDate = new Date(start);
        newDate.setDate(
          start.getDate() + w * 7 + ((targetDay - start.getDay() + 7) % 7)
        );
        list.push({
          date: newDate.toISOString().split("T")[0],
          weekday: d,
        });
      }
    }
    return list;
  };

  // 🗓️ Sinh dữ liệu calendar 5 hàng (tuần) × 7 cột
  const generateCalendarGrid = (startDate) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // lùi về thứ 2
    const grid = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      grid.push({
        date: d,
        label: d.getDate(),
      });
    }
    return grid;
  };

  // 🎨 Giao diện Calendar grid
  const renderCalendar = (selectedClass) => {
    if (!selectedClass?.schedule) return <p>Không có lịch học.</p>;

    let scheduleData;
    try {
      scheduleData =
        typeof selectedClass.schedule === "string"
          ? JSON.parse(selectedClass.schedule)
          : selectedClass.schedule;
    } catch {
      return <p>Lịch học không hợp lệ.</p>;
    }

    const { weeks, days, timeRange } = scheduleData;
    const realDates = generateRealDates(selectedClass.start_date, weeks, days);
    const grid = generateCalendarGrid(selectedClass.start_date);

    const firstDay = new Date(selectedClass.start_date);
    const currentWeekStart = new Date(firstDay);
    currentWeekStart.setDate(firstDay.getDate() + currentWeek * 7);

    const currentGrid = grid.filter(
      (_, i) => i >= currentWeek * 7 && i < (currentWeek + 1) * 7
    );

    return (
      <div className="mt-3 border rounded-xl p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <button
            disabled={currentWeek === 0}
            onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
            className={`px-3 py-1 rounded-md ${
              currentWeek === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            ⬅ Tuần trước
          </button>

          <h4 className="font-semibold text-blue-700">
            Tuần {currentWeek + 1}/{weeks}
          </h4>

          <button
            disabled={currentWeek >= weeks - 1}
            onClick={() => setCurrentWeek((w) => Math.min(weeks - 1, w + 1))}
            className={`px-3 py-1 rounded-md ${
              currentWeek >= weeks - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Tuần sau ➡
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-700 mb-2">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {currentGrid.map((cell) => {
            const isClassDay = realDates.some(
              (r) => r.date === cell.date.toISOString().split("T")[0]
            );
            return (
              <div
                key={cell.date}
                className={`flex items-center justify-center aspect-square text-sm font-semibold rounded-lg border transition-all ${
                  isClassDay
                    ? "bg-green-200 text-green-800 border-green-400 hover:bg-green-300"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
                title={
                  isClassDay
                    ? `Giờ học: ${timeRange?.from} - ${timeRange?.to}`
                    : ""
                }
              >
                {cell.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500">
        ⏳ Đang tải danh sách lớp...
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
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
            {/* ✅ Cột trái */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                Lớp đang dạy
              </h2>

              {classes.length === 0 ? (
                <div className="text-gray-500 italic text-center">
                  Bạn chưa có lớp nào đang dạy.
                </div>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls.class_id}
                    onClick={() => {
                      setSelected(cls);
                      setCurrentWeek(0);
                    }}
                    className={`cursor-pointer mb-4 p-5 rounded-2xl border shadow-md bg-white transition hover:shadow-lg ${
                      selected?.class_id === cls.class_id
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-blue-800 text-lg">
                        {cls.subject} - Lớp {cls.grade}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cls.student_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cls.student_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <p>
                          <b> Địa chỉ:</b>{" "}
                          {selected
                            ? [
                                selected.address || "",
                                selected.ward && `Phường ${selected.ward}`,
                                selected.district &&
                                  `Quận ${selected.district}`,
                                selected.city && `TP. ${selected.city}`,
                              ]
                                .filter(Boolean)
                                .join(", ")
                            : "Chưa có thông tin"}
                        </p>
                      </p>
                      <p className="text-sm text-gray-500">
                        Trạng thái:{" "}
                        <b>{translateStatus(cls.payment_status, cls.status)}</b>
                      </p>
                      <p className="text-sm text-gray-600">
                        Ngày bắt đầu:{" "}
                        <b>
                          {new Date(cls.start_date).toLocaleDateString("vi-VN")}
                        </b>
                      </p>
                      <p className="text-sm text-gray-600">
                        Ngày kết thúc:{" "}
                        <b>
                          {new Date(cls.end_date).toLocaleDateString("vi-VN")}
                        </b>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ✅ Cột phải */}
            <div>
              {selected ? (
                <div className="bg-white rounded-2xl p-6 border shadow-md">
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
                    <b>Học viên:</b> {selected.student_name}
                  </p>
                  <p>
                    <b>Email:</b>{" "}
                    <span className="text-blue-700">
                      {selected.student_email}
                    </span>
                  </p>

                  <hr className="my-3" />

                  <h3 className="text-blue-700 font-semibold mb-2">
                    Thời khóa biểu (Lịch học)
                  </h3>
                  {renderCalendar(selected)}
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
