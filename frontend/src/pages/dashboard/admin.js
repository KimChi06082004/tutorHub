import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import ClassApprovals from "../admin/ClassApprovals";
import TutorApproval from "../admin/tutors-approval";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import TopbarAdmin from "../../components/TopbarAdmin";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("revenue"); // ✅ hiển thị doanh thu mặc định
  const [token, setToken] = useState(null);

  // ======= STATE =======
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

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

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // ✅ Lấy token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");
      setToken(t);
    }
  }, []);

  // ✅ Điều hướng mặc định sang tab=revenue nếu chưa có query
  useEffect(() => {
    if (router.isReady && !router.query.tab) {
      router.replace("/dashboard/admin?tab=revenue");
    }
  }, [router.isReady]);

  // ✅ Lắng nghe router.query.tab để cập nhật tab hiện tại
  useEffect(() => {
    if (router && router.query?.tab) {
      setTab(router.query.tab);
    }
  }, [router.query?.tab]);

  // ✅ Load dữ liệu
  useEffect(() => {
    if (!token) return;
    if (tab === "users") loadUsers(pageUsers);
    if (tab === "classes") loadClasses(pageClasses);
    if (tab === "tutors") loadTutors(pageTutors);
    if (tab === "revenue") loadRevenue();
  }, [tab, token, pageUsers, pageClasses, pageTutors]);

  // ====== API CALLS ======
  const loadUsers = async (page = 1, search = "") => {
    try {
      setLoadingUsers(true);
      const res = await api.get(
        `/users?page=${page}&limit=5&search=${encodeURIComponent(search)}`
      );
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.totalPages);
      } else setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadClasses = async (page = 1, search = "") => {
    try {
      setLoadingClasses(true);
      const res = await api.get(
        `/classes/admin?page=${page}&limit=5&search=${encodeURIComponent(
          search
        )}`
      );
      if (res.data.success) {
        setClasses(res.data.data);
        setTotalClasses(res.data.pagination?.totalPages || 1);
      } else setClasses([]);
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
      } else setTutors([]);
    } finally {
      setLoadingTutors(false);
    }
  };

  const loadRevenue = async () => {
    try {
      setLoadingRevenue(true);

      // 🔹 Nếu chọn tháng → gửi cả month + year
      // 🔹 Nếu không chọn → chỉ gửi year
      const query =
        selectedMonth && selectedMonth !== "all"
          ? `/classes/revenue?year=${selectedYear}&month=${selectedMonth}`
          : `/classes/revenue?year=${selectedYear}`;

      const res = await api.get(query);

      if (res.data.success) {
        // ✅ Dữ liệu dạng [{month: '2025-10', total_revenue: 1000}, ...]
        const data = res.data.data.map((r) => {
          const monthIndex = new Date(r.month + "-01").getMonth() + 1;
          return {
            ...r,
            month: `T${monthIndex}`,
          };
        });
        setRevenueData(data);
      } else {
        setRevenueData([]);
      }
    } catch {
      alert("Lỗi khi tải dữ liệu doanh thu!");
    } finally {
      setLoadingRevenue(false);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <TopbarAdmin />

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#003366]">
          ⚙️ Trang quản trị hệ thống
        </h2>

        {/* ======================= USERS ======================= */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#003366]">
                👥 Quản lý người dùng
              </h3>

              {/* 🔍 Ô tìm kiếm */}
              <input
                type="text"
                placeholder="🔍 Tìm theo tên hoặc email..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:ring focus:ring-blue-200"
                onChange={(e) => loadUsers(1, e.target.value)}
              />
            </div>

            {loadingUsers ? (
              <p className="text-center text-gray-500 py-4">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm border-gray-200 rounded-lg">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Họ tên</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Vai trò</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-center">Hành động</th>
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

                        {/* Dropdown đổi vai trò */}
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              await api.patch(`/users/${u.user_id}/role`, {
                                role: newRole,
                              });
                              loadUsers(pageUsers);
                            }}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                          </select>
                        </td>

                        {/* Trạng thái + Nút khóa/mở */}
                        <td className="p-3">
                          <span
                            className={`font-medium ${
                              u.status === "ACTIVE"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>

                        {/* Nút hành động */}
                        <td className="p-3 flex gap-2 justify-center">
                          {/* Khóa / Mở khóa */}
                          <button
                            onClick={async () => {
                              const newStatus =
                                u.status === "ACTIVE" ? "BANNED" : "ACTIVE";
                              await api.patch(`/users/${u.user_id}/status`, {
                                status: newStatus,
                              });
                              loadUsers(pageUsers);
                            }}
                            className={`px-3 py-1 rounded text-white text-sm ${
                              u.status === "ACTIVE"
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={async () => {
                              if (
                                confirm("Bạn có chắc muốn xóa tài khoản này?")
                              ) {
                                await api.delete(`/users/${u.user_id}`);
                                loadUsers(pageUsers);
                              }
                            }}
                            className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-sm"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ✅ Phân trang */}
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
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#003366]">
              Quản lý lớp học
            </h3>
            {/* 🔍 Ô tìm kiếm lớp */}
            <input
              type="text"
              placeholder="🔍 Tìm theo mã lớp, môn học, tên học viên..."
              className="border border-gray-300 rounded-md px-4 py-3 text-sm w-80 focus:ring focus:ring-blue-200"
              onChange={(e) => loadClasses(1, e.target.value)}
            />
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
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#003366]">
              Danh sách gia sư
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

        {/* ======================= REVENUE ======================= */}
        {tab === "revenue" && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#003366]">
              Thống kê doanh thu theo tháng
            </h3>

            {/* 🔍 Bộ lọc tháng/năm */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <label className="font-medium text-gray-700">Chọn tháng:</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">Tất cả các tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md"
                >
                  ⏮ Năm trước
                </button>
                <span className="font-medium text-gray-700">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md"
                >
                  ⏭ Năm sau
                </button>
              </div>

              <button
                onClick={loadRevenue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md"
              >
                🔎 Tìm kiếm
              </button>
            </div>

            {/* 🧮 Biểu đồ */}
            {loadingRevenue ? (
              <p className="text-center text-gray-500">
                ⏳ Đang tải dữ liệu...
              </p>
            ) : revenueData.length > 0 ? (
              <>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.filter((r) => !!r.total_revenue)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `${Number(value).toLocaleString("vi-VN", {
                            maximumFractionDigits: 0,
                          })} đ`
                        }
                      />

                      <Bar
                        dataKey="total_revenue"
                        fill="#16a34a"
                        name="Tổng doanh thu"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-gray-700 font-medium">
                    Tổng cộng:{" "}
                    {Number(
                      revenueData.reduce(
                        (sum, r) => sum + Number(r.total_revenue || 0),
                        0
                      )
                    ).toLocaleString("vi-VN", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    VND
                  </p>

                  <div className="flex gap-3">
                    {/* Xuất tổng doanh thu */}
                    <button
                      onClick={() => {
                        const ws = XLSX.utils.json_to_sheet(revenueData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "RevenueSummary");
                        XLSX.writeFile(wb, "TongDoanhThuTheoThang.xlsx");
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                    >
                      Xuất tổng doanh thu
                    </button>

                    {/* Xuất chi tiết giao dịch */}
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get(
                            `/payments/all?month=${selectedMonth}&year=${selectedYear}`
                          );
                          if (!res.data.success)
                            throw new Error("Không có dữ liệu");
                          const ws = XLSX.utils.json_to_sheet(res.data.data);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(
                            wb,
                            ws,
                            "PaymentDetails"
                          );
                          XLSX.writeFile(wb, "ChiTietGiaoDich.xlsx");
                        } catch (err) {
                          alert("Lỗi khi xuất file chi tiết: " + err.message);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                    >
                      Xuất giao dịch chi tiết
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                Không có dữ liệu doanh thu
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Component phân trang tái sử dụng
function Pagination({ page, total, onPrev, onNext }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={onPrev}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
          page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
          page === total
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
        }`}
      >
        ▶
      </button>
    </div>
  );
}
