// frontend/src/pages/dashboard/admin.js
import { useState, useEffect } from "react";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";
import ClassApprovals from "../admin/ClassApprovals";
import TutorApproval from "../admin/tutors-approval"; // ✅ import giao diện quản lý gia sư

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [token, setToken] = useState(null);

  // ✅ Lấy token sau khi render client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");
      setToken(t);
    }
  }, []);

  // ✅ Load dữ liệu theo tab
  useEffect(() => {
    if (!token) return;
    if (tab === "users") loadUsers();
    if (tab === "complaints") loadComplaints();
    if (tab === "payouts") loadPayouts();
  }, [tab, token]);

  // ====== API ======
  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const loadComplaints = async () => {
    const res = await api.get("/complaints");
    setComplaints(res.data);
  };

  const loadPayouts = async () => {
    const res = await api.get("/payouts");
    setPayouts(res.data);
  };

  const resolveComplaint = async (id, resolution) => {
    await api.put(`/complaints/${id}`, { resolution });
    alert("✅ Complaint resolved!");
    loadComplaints();
  };

  const payoutTutor = async (id, amount) => {
    await api.put(`/payouts/${id}`, { status: "PAID", amount });
    alert("💵 Payout completed!");
    loadPayouts();
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        ⏳ Đang tải dữ liệu hoặc bạn chưa đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          🛠️ Admin Dashboard
        </h2>

        {/* Thanh menu tab */}
        <nav className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded font-medium ${
              tab === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            👤 Users
          </button>
          <button
            onClick={() => setTab("classes")}
            className={`px-4 py-2 rounded font-medium ${
              tab === "classes"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            📚 Classes
          </button>
          <button
            onClick={() => setTab("tutors")}
            className={`px-4 py-2 rounded font-medium ${
              tab === "tutors"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            📋 Tutors
          </button>
          <button
            onClick={() => setTab("complaints")}
            className={`px-4 py-2 rounded font-medium ${
              tab === "complaints"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            ⚠️ Complaints
          </button>
          <button
            onClick={() => setTab("payouts")}
            className={`px-4 py-2 rounded font-medium ${
              tab === "payouts"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            💵 Payouts
          </button>
        </nav>

        {/* ========== TAB HIỂN THỊ ========== */}

        {/* 👤 USERS */}
        {tab === "users" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              👥 Danh sách người dùng
            </h3>
            {users.length === 0 ? (
              <p className="text-gray-500 text-center">
                Không có người dùng nào.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm border-gray-200 rounded-lg">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Họ tên</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.user_id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3">{u.user_id}</td>
                        <td className="p-3 font-medium text-gray-800">
                          {u.full_name}
                        </td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td
                          className={`p-3 font-medium ${
                            u.role === "admin"
                              ? "text-red-600"
                              : u.role === "tutor"
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {u.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 📚 CLASSES */}
        {tab === "classes" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ClassApprovals />
          </div>
        )}

        {/* 📋 TUTORS */}
        {tab === "tutors" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <TutorApproval />
          </div>
        )}

        {/* ⚠️ COMPLAINTS */}
        {tab === "complaints" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              ⚠️ Khiếu nại người dùng
            </h3>
            {complaints.length === 0 ? (
              <p className="text-gray-500 text-center">
                Không có khiếu nại nào.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {complaints.map((cp) => (
                  <li key={cp.complaint_id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          #{cp.complaint_id} – {cp.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Trạng thái: {cp.status}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          resolveComplaint(cp.complaint_id, "Đã xử lý")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        ✅ Đánh dấu đã xử lý
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 💵 PAYOUTS */}
        {tab === "payouts" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              💵 Thanh toán gia sư
            </h3>
            {payouts.length === 0 ? (
              <p className="text-gray-500 text-center">
                Không có giao dịch thanh toán.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {payouts.map((p) => (
                  <li key={p.payout_id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        #{p.payout_id} – Tutor {p.tutor_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {p.amount.toLocaleString()}đ – Trạng thái:{" "}
                        <span
                          className={`font-medium ${
                            p.status === "PAID"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </p>
                    </div>
                    {p.status === "PENDING" && (
                      <button
                        onClick={() => payoutTutor(p.payout_id, p.amount)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                      >
                        💰 Thanh toán
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
