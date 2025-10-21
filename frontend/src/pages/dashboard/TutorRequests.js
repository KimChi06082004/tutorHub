import { useEffect, useState } from "react";
import api from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import TopbarTutor from "../../components/TopbarTutor";

export default function TutorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load danh sách yêu cầu
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/requests");
        if (res.data.success) setRequests(res.data.data);
      } catch (err) {
        console.error("❌ Lỗi tải yêu cầu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // 🔹 Gia sư đồng ý / từ chối yêu cầu
  const handleRespond = async (id, status) => {
    try {
      const res = await api.put(`/requests/${id}`, { status });
      if (res.data.success) {
        alert(res.data.message);
        setRequests((prev) =>
          prev.map((r) => (r.request_id === id ? { ...r, status: status } : r))
        );
      }
    } catch (err) {
      alert("🚨 Lỗi cập nhật trạng thái: " + err.message);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-500">⏳ Đang tải danh sách yêu cầu...</p>
    );

  return (
    <div>
      <Sidebar />
      <TopbarTutor />

      <div className="ml-56 pt-[80px] p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-semibold text-[#003366] mb-6 flex items-center">
          📩 Danh sách yêu cầu học viên
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">Chưa có yêu cầu học nào.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requests.map((r) => (
              <div
                key={r.request_id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      r.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                    }
                    alt="student avatar"
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.student_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {r.subject || "Không có môn học"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  💬 {r.message || "Không có lời nhắn"}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  🕒 Gửi lúc: {new Date(r.created_at).toLocaleString()}
                </p>

                {/* Nút phản hồi */}
                {r.status === "PENDING" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond(r.request_id, "APPROVED")}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1 rounded"
                    >
                      ✅ Đồng ý
                    </button>
                    <button
                      onClick={() => handleRespond(r.request_id, "REJECTED")}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1 rounded"
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                ) : (
                  <p
                    className={`text-sm font-semibold ${
                      r.status === "APPROVED"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {r.status === "APPROVED" ? "✅ Đã đồng ý" : "❌ Đã từ chối"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
