import { useEffect, useState } from "react";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";

export default function CSKHDashboard() {
  const [tab, setTab] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [pendingTutors, setPendingTutors] = useState([]);

  // Load dữ liệu theo tab
  useEffect(() => {
    if (tab === "classes")
      api
        .get("/classes?status=PENDING_ADMIN_APPROVAL")
        .then((res) => setClasses(res.data));

    if (tab === "complaints")
      api.get("/complaints").then((res) => setComplaints(res.data));

    if (tab === "tutors")
      api
        .get("/tutors?status=PENDING")
        .then((res) => setPendingTutors(res.data));
  }, [tab]);

  // Xử lý approve/reject tutor
  const handleTutorDecision = async (id, decision) => {
    try {
      await api.put(`/tutors/${id}/approve`, { status: decision });
      alert(`Tutor ${decision}`);
      setPendingTutors(pendingTutors.filter((t) => t.tutor_id !== id));
    } catch (err) {
      console.error("Approve/Reject error:", err);
      alert("Failed to update tutor status");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>🛠 CSKH Dashboard</h2>

        {/* Navigation */}
        <nav style={{ marginBottom: 20 }}>
          <button onClick={() => setTab("classes")}>📚 Pending Classes</button>
          <button onClick={() => setTab("tutors")}>👩‍🏫 Tutors Approval</button>
          <button onClick={() => setTab("complaints")}>⚠️ Complaints</button>
        </nav>

        {/* Tab: Pending Classes */}
        {tab === "classes" && (
          <div>
            <h3>📚 Classes Pending Approval</h3>
            <ul>
              {classes.map((c) => (
                <li key={c.class_id}>
                  {c.subject} - {c.grade} ({c.student_name}) → {c.status}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab: Tutors Approval */}
        {tab === "tutors" && (
          <div>
            <h3>👩‍🏫 Tutors Pending Approval</h3>
            <ul>
              {pendingTutors.map((t) => (
                <li key={t.tutor_id}>
                  {t.full_name} ({t.subject}) - {t.city} - {t.hourly_rate}đ/h
                  <br />
                  <button
                    onClick={() => handleTutorDecision(t.tutor_id, "APPROVED")}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleTutorDecision(t.tutor_id, "REJECTED")}
                    style={{ marginLeft: 10 }}
                  >
                    ❌ Reject
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab: Complaints */}
        {tab === "complaints" && (
          <div>
            <h3>⚠️ Complaints</h3>
            <ul>
              {complaints.map((c) => (
                <li key={c.complaint_id}>
                  Complaint #{c.complaint_id} - {c.description} ({c.status})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
