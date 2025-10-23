import { useEffect, useState } from "react";
import api from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import TopbarStudent from "../../components/TopbarStudent";

export default function TutorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/requests")
      .then((res) => setRequests(res.data.data || []))
      .catch((err) => console.error("❌ Lỗi tải danh sách ứng tuyển:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>;

  // 🧩 Gửi phản hồi đến backend
  async function handleRespond(id, status) {
    try {
      const res = await api.put(`/requests/${id}/respond`, { status });
      alert(res.data.message);

      setRequests((prev) =>
        prev.map((r) => (r.request_id === id ? { ...r, status: status } : r))
      );
    } catch (err) {
      console.error("❌ Lỗi phản hồi:", err.response?.data || err);
      alert("❌ Lỗi phản hồi yêu cầu!");
    }
  }

  // 🧩 Map trạng thái sang tiếng Việt
  const translateStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return "Đã chấp nhận";
      case "REJECTED":
        return "Đã từ chối";
      case "PENDING":
        return "Đang chờ duyệt";
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <TopbarStudent />
        <div className="mt-20"></div>

        <div className="max-w-5xl mx-auto p-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            👨‍🏫 Danh sách gia sư ứng tuyển
          </h2>

          {requests.length === 0 ? (
            <p className="text-gray-500 text-center">
              Chưa có gia sư nào ứng tuyển lớp của bạn.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div
                  key={r.request_id}
                  className="bg-white rounded-xl shadow-md p-5 border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {r.tutor_name}
                    </h3>
                    <p className="text-gray-500">
                      📘 Môn: {r.subject} | Trạng thái:{" "}
                      <span
                        className={`font-medium ${
                          r.status === "PENDING"
                            ? "text-yellow-500"
                            : r.status === "APPROVED"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {translateStatus(r.status)}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-2">{r.message}</p>
                  </div>

                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(r.request_id, "APPROVED")}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        ✅ Đồng ý
                      </button>
                      <button
                        onClick={() => handleRespond(r.request_id, "REJECTED")}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
