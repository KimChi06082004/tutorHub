import { useState, useEffect } from "react";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";
import ClassApprovals from "../admin/ClassApprovals";
import TutorApproval from "../admin/tutors-approval";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  // ======= STATE =======
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [complaints, setComplaints] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [token, setToken] = useState(null);

  // ======= Pagination =======
  const [pageUsers, setPageUsers] = useState(1);
  const [totalUsers, setTotalUsers] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [pageClasses, setPageClasses] = useState(1);
  const [totalClasses, setTotalClasses] = useState(1);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [pageTutors, setPageTutors] = useState(1);
  const [totalTutors, setTotalTutors] = useState(1);
  const [loadingTutors, setLoadingTutors] = useState(false);

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

  // ✅ Load dữ liệu theo tab hoặc phân trang
  useEffect(() => {
    if (!token) return;
    if (tab === "users") loadUsers(pageUsers);
    if (tab === "classes") loadClasses(pageClasses);
    if (tab === "tutors") loadTutors(pageTutors);
    if (tab === "complaints") loadComplaints();
    if (tab === "payouts") loadPayouts();
  }, [tab, token, pageUsers, pageClasses, pageTutors]);

  // ====== API CALLS ======
  const loadUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const res = await api.get(`/users?page=${page}&limit=5`);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.totalPages);
      } else {
        setUsers([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadClasses = async (page = 1) => {
    try {
      setLoadingClasses(true);
      // ✅ Sửa route: gọi /classes/admin thay vì /classes
      const res = await api.get(`/classes/admin?page=${page}&limit=5`);
      if (res.data.success) {
        setClasses(res.data.data);
        setTotalClasses(res.data.pagination?.totalPages || 1);
      } else {
        setClasses([]);
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadTutors = async (page = 1) => {
    try {
      setLoadingTutors(true);
      const res = await api.get(`/tutors?page=${page}&limit=5`);
      if (res.data.success) {
        setTutors(res.data.data);
        setTotalTutors(res.data.pagination.totalPages);
      } else {
        setTutors([]);
      }
    } finally {
      setLoadingTutors(false);
    }
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

  // ======================= UI =======================
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

        {/* ======================= TAB MENU ======================= */}
        <nav className="flex justify-center gap-3 mb-8">
          {[
            ["users", "👤 Users", "bg-blue-600"],
            ["classes", "📚 Classes", "bg-green-600"],
            ["tutors", "📋 Tutors", "bg-yellow-500"],
            ["complaints", "⚠️ Complaints", "bg-red-500"],
            ["payouts", "💵 Payouts", "bg-indigo-500"],
          ].map(([key, label, color]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded font-medium transition ${
                tab === key
                  ? `${color} text-white`
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ======================= USERS ======================= */}
        {tab === "users" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              👥 Danh sách người dùng
            </h3>
            {loadingUsers ? (
              <p className="text-center text-gray-500 py-4">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : Array.isArray(users) && users.length > 0 ? (
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

                {/* ✅ Pagination Users */}
                <Pagination
                  page={pageUsers}
                  total={totalUsers}
                  onPrev={() => setPageUsers((p) => p - 1)}
                  onNext={() => setPageUsers((p) => p + 1)}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Không có người dùng nào.
              </p>
            )}
          </div>
        )}

        {/* ======================= CLASSES ======================= */}
        {tab === "classes" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              📚 Quản lý lớp học
            </h3>

            {loadingClasses ? (
              <p className="text-center text-gray-500 py-4">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : (
              <ClassApprovals classes={classes} />
            )}

            <Pagination
              page={pageClasses}
              total={totalClasses}
              onPrev={() => setPageClasses((p) => p - 1)}
              onNext={() => setPageClasses((p) => p + 1)}
            />
          </div>
        )}

        {/* ======================= TUTORS ======================= */}
        {tab === "tutors" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Danh sách gia sư
            </h3>

            {loadingTutors ? (
              <p className="text-center text-gray-500 py-4">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : (
              <TutorApproval tutors={tutors} />
            )}

            <Pagination
              page={pageTutors}
              total={totalTutors}
              onPrev={() => setPageTutors((p) => p - 1)}
              onNext={() => setPageTutors((p) => p + 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Component phân trang tái sử dụng
function Pagination({ page, total, onPrev, onNext }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-3 pb-2">
      <button
        disabled={page === 1}
        onClick={onPrev}
        className={`px-2 py-1 rounded border text-sm font-medium transition ${
          page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        ◀
      </button>
      <span className="text-gray-700 text-sm font-medium">
        Trang {page} / {total}
      </span>
      <button
        disabled={page === total}
        onClick={onNext}
        className={`px-2 py-1 rounded border text-sm font-medium transition ${
          page === total
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        ▶
      </button>
    </div>
  );
}
