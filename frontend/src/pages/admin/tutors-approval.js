import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TutorApproval() {
  const [tutors, setTutors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [view, setView] = useState("pending"); // pending | approved | rejected

  useEffect(() => {
    const t =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");
    setToken(t);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTutors();
      fetchHistory();
    }
  }, [token, view]);

  // ✅ Lấy danh sách theo trạng thái hiện tại
  const fetchTutors = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (view === "pending") endpoint = "/tutors/pending";
      else if (view === "approved") endpoint = "/tutors/approved";
      else if (view === "rejected") endpoint = "/tutors/rejected";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTutors(data.data || []);
      else alert("⚠️ Không tải được dữ liệu hồ sơ!");
    } catch (err) {
      console.error("⚠️ Fetch tutors error:", err);
      alert("⚠️ Lỗi tải danh sách hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy lịch sử duyệt hồ sơ
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/tutors/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistory(data.data || []);
    } catch (err) {
      console.error("⚠️ Fetch history error:", err);
    }
  };

  // ✅ Format ngày hiển thị
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleString("vi-VN");
    } catch {
      return "-";
    }
  };

  return (
    <div>
      <div className="main-content bg-gray-50 min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📋 Quản lý hồ sơ gia sư
          </h2>

          {/* Bộ chọn trạng thái */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              className={`px-4 py-2 rounded font-medium ${
                view === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setView("pending")}
            >
              ⏳ Chờ duyệt
            </button>
            <button
              className={`px-4 py-2 rounded font-medium ${
                view === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setView("approved")}
            >
              ✅ Đã duyệt
            </button>
            <button
              className={`px-4 py-2 rounded font-medium ${
                view === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setView("rejected")}
            >
              ❌ Từ chối
            </button>
          </div>

          {/* Bảng dữ liệu */}
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : tutors.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có hồ sơ nào trong mục này 🎉
            </p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Họ tên</th>
                  <th className="p-3 text-left">Trường</th>
                  <th className="p-3 text-left">Chuyên ngành</th>
                  <th className="p-3 text-left">
                    {view === "approved"
                      ? "Thời gian duyệt"
                      : view === "rejected"
                      ? "Thời gian từ chối"
                      : "Ngày gửi"}
                  </th>
                  {view === "rejected" && (
                    <th className="p-3 text-left">Lý do từ chối</th>
                  )}
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((t, i) => (
                  <tr
                    key={t.tutor_id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {t.full_name}
                    </td>
                    <td className="p-3">{t.university}</td>
                    <td className="p-3">{t.major}</td>
                    <td className="p-3 text-gray-500">
                      {view === "approved"
                        ? formatDate(t.approved_at)
                        : view === "rejected"
                        ? formatDate(t.rejected_at)
                        : formatDate(t.created_at)}
                    </td>

                    {view === "rejected" && (
                      <td className="p-3 text-gray-600 italic">
                        {t.reject_reason || "Không có lý do"}
                      </td>
                    )}

                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/TutorDetail?id=${t.tutor_id}`)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                      >
                        👁️ Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Lịch sử duyệt */}
          {view === "pending" && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                📜 Lịch sử duyệt hồ sơ
              </h3>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Chưa có lịch sử duyệt hồ sơ.
                </p>
              ) : (
                <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Họ tên</th>
                      <th className="p-2 text-left">Trường</th>
                      <th className="p-2 text-left">Ngành học</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 text-left">Cập nhật</th>
                      <th className="p-2 text-left">Lý do (nếu có)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history
                      .slice()
                      .reverse()
                      .map((h) => (
                        <tr
                          key={h.tutor_id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-2">{h.full_name}</td>
                          <td className="p-2">{h.university}</td>
                          <td className="p-2">{h.major}</td>
                          <td className="p-2">
                            {h.status === "APPROVED" ? (
                              <span className="text-green-600 font-medium">
                                ✅ Đã duyệt
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                ❌ Từ chối
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-gray-500">
                            {formatDate(h.updated_at)}
                          </td>
                          <td className="p-2 text-gray-600 italic">
                            {h.reject_reason || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
