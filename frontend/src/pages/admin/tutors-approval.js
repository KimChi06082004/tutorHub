import { useEffect, useState } from "react";
import TopbarAdmin from "../../components/TopbarAdmin";
import Sidebar from "../../components/Sidebar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TutorApproval() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  // moved token handling into state so we don't access localStorage during SSR
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // === Gọi API lấy danh sách chờ duyệt ===
  const fetchPendingTutors = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/tutors/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTutors(data.data);
      setLoading(false);
    } catch (err) {
      alert("⚠️ Lỗi tải danh sách hồ sơ!");
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // read token only on client
    if (typeof window === "undefined") return;
    const t =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null;
    setToken(t);
  }, []);

  // when token becomes available on client, load tutors
  useEffect(() => {
    if (token) fetchPendingTutors();
    else if (token === null) {
      // no token found -> stop loading to avoid perpetual spinner
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Don't render the main content until we're on the client side
  if (!isClient) {
    return (
      <div className="main-content bg-gray-50 min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // === Duyệt hoặc từ chối ===
  const handleApprove = async (id, status) => {
    if (
      !confirm(
        `Xác nhận ${status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"} hồ sơ này?`
      )
    )
      return;

    if (!token) {
      alert("⚠️ Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tutors/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        fetchPendingTutors(); // load lại danh sách
      } else alert("❌ " + (data.message || "Lỗi duyệt hồ sơ"));
    } catch (err) {
      alert("🚨 Server error!");
    }
  };

  return (
    <div>
      <Sidebar />
      <TopbarAdmin />

      <div className="main-content bg-gray-50 min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📋 Duyệt hồ sơ gia sư
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : tutors.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có hồ sơ nào đang chờ duyệt 🎉
            </p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Họ tên</th>
                  <th className="p-3 text-left">Trường</th>
                  <th className="p-3 text-left">Chuyên ngành</th>
                  <th className="p-3 text-left">Ngày gửi</th>
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
                      {new Date(t.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(t.tutor_id, "APPROVED")}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        onClick={() => handleApprove(t.tutor_id, "REJECTED")}
                        className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                      >
                        ❌ Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
