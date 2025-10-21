// frontend/src/pages/dashboard/admin.js
import { useState, useEffect } from "react";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";
import ClassApprovals from "../admin/ClassApprovals";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [token, setToken] = useState(null); // ✅ Lưu token sau khi load client

  // ✅ Lấy token sau khi render client (fix lỗi localStorage undefined)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");
      setToken(t);
    }
  }, []);

  // ===== Load dữ liệu theo tab =====
  useEffect(() => {
    if (!token) return; // chỉ load sau khi có token
    if (tab === "users") api.get("/users").then((res) => setUsers(res.data));
    if (tab === "complaints")
      api.get("/complaints").then((res) => setComplaints(res.data));
    if (tab === "payouts")
      api.get("/payouts").then((res) => setPayouts(res.data));
    if (tab === "tutors") loadPendingTutors();
  }, [tab, token]); // ✅ thêm token vào dependency

  // ===== Load hồ sơ gia sư chờ duyệt =====
  const loadPendingTutors = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tutors/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTutors(data.data);
      else alert("❌ Lỗi tải danh sách hồ sơ!");
    } catch (err) {
      console.error(err);
      alert("🚨 Lỗi kết nối server!");
    }
  };

  // ===== Duyệt / Từ chối hồ sơ =====
  const handleApprove = async (id, status) => {
    if (
      !confirm(
        `Xác nhận ${status === "APPROVED" ? "duyệt" : "từ chối"} hồ sơ này?`
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tutors/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        loadPendingTutors();
      } else alert("❌ " + (data.message || "Lỗi duyệt hồ sơ"));
    } catch (err) {
      alert("🚨 Lỗi server!");
    }
  };

  // ===== Giải quyết khiếu nại =====
  const resolveComplaint = async (id, resolution) => {
    await api.put(`/complaints/${id}`, { resolution });
    alert("Complaint updated ✅");
    setTab("complaints");
  };

  // ===== Thanh toán =====
  const payoutTutor = async (id, amount) => {
    await api.put(`/payouts/${id}`, { status: "PAID", amount });
    alert("Payout processed 💵");
    setTab("payouts");
  };

  // ===== Khi chưa load token =====
  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "18px",
        }}
      >
        ⏳ Đang tải dữ liệu hoặc bạn chưa đăng nhập...
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>🛠️ Admin Dashboard</h2>

        {/* ===== Thanh điều hướng ===== */}
        <nav style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
          <button onClick={() => setTab("users")}>👤 Users</button>
          <button onClick={() => setTab("classes")}>📚 Classes</button>
          <button onClick={() => setTab("tutors")}>📋 Tutors</button>
          <button onClick={() => setTab("complaints")}>⚠️ Complaints</button>
          <button onClick={() => setTab("payouts")}>💵 Payouts</button>
        </nav>

        {/* Các tab hiển thị giữ nguyên */}
        {tab === "users" && (
          <div>
            <h3>👤 Users</h3>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.user_id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "classes" && <ClassApprovals />}

        {tab === "tutors" && (
          <div>
            <h3>📋 Hồ sơ gia sư chờ duyệt</h3>
            {tutors.length === 0 ? (
              <p>Không có hồ sơ nào đang chờ duyệt 🎉</p>
            ) : (
              <table border="1" cellPadding="8" width="100%">
                <thead style={{ background: "#f1f5f9" }}>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Trường</th>
                    <th>Ngành học</th>
                    <th>Ngày gửi</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((t) => (
                    <tr key={t.tutor_id}>
                      <td>{t.tutor_id}</td>
                      <td>{t.full_name}</td>
                      <td>{t.university}</td>
                      <td>{t.major}</td>
                      <td>
                        {new Date(t.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <button
                          onClick={() => handleApprove(t.tutor_id, "APPROVED")}
                          style={{
                            background: "green",
                            color: "#fff",
                            marginRight: "8px",
                            border: "none",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          ✅ Duyệt
                        </button>
                        <button
                          onClick={() => handleApprove(t.tutor_id, "REJECTED")}
                          style={{
                            background: "red",
                            color: "#fff",
                            border: "none",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
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
        )}

        {tab === "complaints" && (
          <div>
            <h3>⚠️ Complaints</h3>
            <ul>
              {complaints.map((cp) => (
                <li key={cp.complaint_id} style={{ marginBottom: 10 }}>
                  #{cp.complaint_id} – {cp.title} ({cp.status})
                  <button
                    onClick={() =>
                      resolveComplaint(cp.complaint_id, "Resolved by admin")
                    }
                    style={{ marginLeft: 10 }}
                  >
                    ✅ Resolve
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "payouts" && (
          <div>
            <h3>💵 Payouts</h3>
            <ul>
              {payouts.map((p) => (
                <li key={p.payout_id} style={{ marginBottom: 10 }}>
                  #{p.payout_id} – Tutor {p.tutor_id} – {p.status} – {p.amount}đ
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => payoutTutor(p.payout_id, p.amount)}
                      style={{ marginLeft: 10 }}
                    >
                      💰 Pay Now
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
