import { useEffect, useState } from "react";
import api from "../../utils/api";
import SidebarTutor from "../../components/SidebarTutor";
import TopbarTutor from "../../components/TopbarTutor";
import Footer from "../../components/Footer";
import dynamic from "next/dynamic";

const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

export default function SelectedClasses() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [classDetail, setClassDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 🧩 Lấy danh sách lời mời học viên gửi đến gia sư
  const fetchRequests = async () => {
    try {
      const res = await api.get("/tutor/selected-classes");
      if (res.data?.success) setRequests(res.data.data || []);
      else setRequests([]);
    } catch (err) {
      console.error(" Lỗi tải danh sách lời mời:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 📘 Lấy chi tiết lớp từ backend
  const fetchClassDetail = async (classId) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/tutor/selected-classes/${classId}/detail`);
      if (res.data?.success) setClassDetail(res.data.data);
      else setClassDetail(null);
    } catch (err) {
      console.error(" Lỗi tải chi tiết lớp:", err);
      alert("Không thể tải chi tiết lớp này!");
      setClassDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ✅ Gia sư chấp nhận lớp
  const handleAccept = async (id) => {
    if (!confirm("Xác nhận chấp nhận lớp này?")) return;
    try {
      const res = await api.post(`/tutor/selected-classes/${id}/accept`);
      if (res.data?.success) {
        alert(" " + res.data.message);
        setRequests((prev) => prev.filter((r) => r.request_id !== id));
        setSelectedRequest(null);
      } else {
        alert(res.data?.message || "Không thể chấp nhận lớp.");
      }
    } catch (err) {
      console.error(" Lỗi khi chấp nhận lớp:", err);
      alert(err.response?.data?.message || "Lỗi khi chấp nhận lớp!");
    }
  };

  // ❌ Gia sư từ chối lớp
  const handleReject = async (id) => {
    if (!confirm("Bạn có chắc muốn từ chối lớp này?")) return;
    try {
      const res = await api.post(`/tutor/selected-classes/${id}/reject`);
      if (res.data?.success) {
        alert(" " + res.data.message);
        setRequests((prev) => prev.filter((r) => r.request_id !== id));
        setSelectedRequest(null);
      } else {
        alert(res.data?.message || "Không thể từ chối lớp!");
      }
    } catch (err) {
      console.error(" Lỗi từ chối lớp:", err);
      alert(err.response?.data?.message || "Không thể từ chối lớp!");
    }
  };

  // 🧭 Hiển thị lịch học
  const renderSchedule = (scheduleStr) => {
    try {
      const s = JSON.parse(scheduleStr);
      const days = s.days?.join(", ") || "Chưa có";
      const from = s.timeRange?.from || "??";
      const to = s.timeRange?.to || "??";
      return `${days} (${from} - ${to})`;
    } catch {
      return "Không có thông tin lịch học";
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-500 text-center">
        ⏳ Đang tải danh sách lớp học được mời...
      </p>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 hidden md:block">
        <SidebarTutor />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 md:p-10 mt-[80px]">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Danh sách lớp học viên đã mời bạn dạy
            </h2>

            {requests.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                Hiện bạn chưa nhận được lời mời nào từ học viên.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {requests.map((req) => (
                  <div
                    key={req.request_id}
                    className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-green-600 text-lg">
                        Mã lớp: TN{req.class_id}
                      </p>
                      <span className="text-gray-500 text-sm">
                        📍 {req.city}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <b>Học viên:</b> {req.student_name}
                      </p>
                      <p>
                        <b>Môn học:</b> {req.class_subject}
                      </p>
                      <p>
                        <b>Học phí:</b> {req.tuition_amount?.toLocaleString()}{" "}
                        VNĐ/h
                      </p>
                      <p>
                        <b>Lịch học:</b> {renderSchedule(req.schedule || "{}")}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        fetchClassDetail(req.class_id);
                      }}
                      className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg font-medium transition"
                    >
                      Xem chi tiết lớp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* MODAL CHI TIẾT LỚP */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[95%] max-w-4xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center bg-yellow-400 text-white rounded-t-2xl px-6 py-4">
              <h3 className="text-lg font-semibold">
                Mã lớp: TN{selectedRequest.class_id}
              </h3>
              <div className="space-x-3">
                <button
                  onClick={() => handleReject(selectedRequest.request_id)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md font-medium"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleAccept(selectedRequest.request_id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-md font-medium"
                >
                  Đồng ý
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="ml-2 text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3 text-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
                  {selectedRequest.student_name?.[0] || "U"}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedRequest.student_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Học viên đã gửi lời mời dạy lớp này
                  </p>
                </div>
              </div>

              <hr />

              {/* Chi tiết lớp */}
              {loadingDetail ? (
                <p className="text-gray-500 italic">
                  ⏳ Đang tải chi tiết lớp...
                </p>
              ) : classDetail ? (
                <>
                  <p>
                    <b>Môn học:</b> {classDetail.subject}
                  </p>
                  <p>
                    <b>Lớp:</b> {classDetail.grade || "Chưa rõ"}
                  </p>
                  <p>
                    <b>Học phí:</b>{" "}
                    {classDetail.tuition_amount?.toLocaleString()} VNĐ/h
                  </p>
                  <p>
                    <b>Lịch học:</b>{" "}
                    {renderSchedule(classDetail.schedule || "{}")}
                  </p>
                  <p>
                    <b>Khu vực:</b>{" "}
                    {[classDetail.ward, classDetail.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    <b>Yêu cầu:</b>{" "}
                    {classDetail.requirements || "Không có yêu cầu đặc biệt"}
                  </p>
                  <p>
                    <b>Mô tả lớp:</b>{" "}
                    {classDetail.description || "Không có mô tả."}
                  </p>
                  <p>
                    <b>Học viên:</b> {classDetail.student_name}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 italic">
                  Không tìm thấy thông tin lớp.
                </p>
              )}

              {/* Bản đồ lớp */}
              <div className="w-full h-72 rounded-lg overflow-hidden border mt-4">
                <VietnamMap
                  lat={
                    !isNaN(parseFloat(classDetail?.lat))
                      ? parseFloat(classDetail.lat)
                      : 10.75
                  }
                  lng={
                    !isNaN(parseFloat(classDetail?.lng))
                      ? parseFloat(classDetail.lng)
                      : 106.65
                  }
                  zoom={13}
                  singleMarker={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
