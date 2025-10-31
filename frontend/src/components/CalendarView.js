// frontend/src/components/CalendarView.js
import { useState } from "react";

/**
 * Component hiển thị thời khóa biểu dạng lưới tuần (T2 → CN)
 * Dùng cho trang: Lớp đang học / Lớp đã kết thúc
 * schedule = {
 *   weeks: 3,
 *   days: ["T2", "T5", "T7"],
 *   timeRange: { from: "18:00", to: "20:00" }
 * }
 */
export default function CalendarView({ schedule = {} }) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const daysMap = {
    T2: "Thứ 2",
    T3: "Thứ 3",
    T4: "Thứ 4",
    T5: "Thứ 5",
    T6: "Thứ 6",
    T7: "Thứ 7",
    CN: "CN",
  };

  const [week, setWeek] = useState(1);
  const totalWeeks = schedule.weeks || 1;
  const selectedDays = schedule.days || [];
  const from = schedule?.timeRange?.from || null;
  const to = schedule?.timeRange?.to || null;

  if (!selectedDays.length) {
    return <p className="text-gray-500 italic">Không có lịch học</p>;
  }

  return (
    <div className="border rounded-xl p-4 mt-3 bg-gray-50">
      {/* --- Header chọn tuần --- */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setWeek((prev) => Math.max(1, prev - 1))}
          disabled={week <= 1}
          className={`px-3 py-1 rounded-md border ${
            week <= 1
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          ← Tuần trước
        </button>

        <span className="font-semibold text-blue-600">
          Tuần {week}/{totalWeeks}
        </span>

        <button
          onClick={() => setWeek((prev) => Math.min(totalWeeks, prev + 1))}
          disabled={week >= totalWeeks}
          className={`px-3 py-1 rounded-md border ${
            week >= totalWeeks
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Tuần sau →
        </button>
      </div>

      {/* --- Lưới hiển thị ngày trong tuần --- */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map((d, i) => {
          const isSelected = selectedDays.includes(d);
          return (
            <div
              key={i}
              className={`border rounded-lg p-2 text-sm ${
                isSelected
                  ? "bg-green-100 border-green-400 text-green-700 font-semibold"
                  : "bg-white text-gray-400"
              }`}
            >
              <div className="font-medium mb-1">{daysMap[d]}</div>
              {isSelected ? (
                <div className="text-xs">
                  ⏰ {from} - {to}
                </div>
              ) : (
                <div className="text-xs text-gray-300">–</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
