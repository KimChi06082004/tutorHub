import { useEffect, useState } from "react";
import api from "../../utils/api";
import SidebarTutor from "../../components/SidebarTutor";
import TopbarTutor from "../../components/TopbarTutor";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";

export default function TutorPayments() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();
  const walletBalance = 4800000; // Demo số dư ví

  /* =========================================================
     🧾 Lấy danh sách lớp cần thanh toán
  ========================================================= */
  const fetchPayments = async () => {
    try {
      const res = await api.get("/classes/payment/pending");
      if (res.data.success) {
        const withDeadline = res.data.data.map((cls) => ({
          ...cls,
          payment_deadline: cls.payment_deadline
            ? new Date(cls.payment_deadline)
            : null,
        }));

        // ✅ Log sau khi đã có dữ liệu
        console.log(
          "🕒 Payment deadlines:",
          withDeadline.map((c) => ({
            id: c.class_id,
            deadline: new Date(c.payment_deadline).toLocaleString(),
          }))
        );

        setClasses(withDeadline);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error("❌ Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPayments();
  }, [router.asPath]);
  //   /* =========================================================
  //      🕒 Đếm ngược thời gian thanh toán (hết hạn → cập nhật DB)
  //   ========================================================= */
  //   useEffect(() => {
  //     if (!selectedClass?.payment_deadline) return;

  //     const checkDeadline = async () => {
  //       const now = new Date();
  //       const deadline = new Date(selectedClass.payment_deadline);
  //       const diff = deadline - now;

  //       console.log(
  //         `⏳ [CHECK] Lớp ${
  //           selectedClass.class_id
  //         } | Deadline: ${deadline.toLocaleString()} | Now: ${now.toLocaleString()} | Diff(ms): ${diff}`
  //       );

  //       if (diff <= 0) {
  //         console.log("⚠️ Đã hết hạn thanh toán!");
  //         setTimeLeft("⏰ Hết hạn thanh toán");

  //         try {
  //           await api.put(`/classes/${selectedClass.class_id}/expire-payment`);
  //           console.log(
  //             "✅ Đã cập nhật hết hạn cho lớp:",
  //             selectedClass.class_id
  //           );
  //         } catch (err) {
  //           console.error("❌ Lỗi khi cập nhật hết hạn:", err);
  //         }

  //         setClasses((prev) =>
  //           prev.filter((c) => c.class_id !== selectedClass.class_id)
  //         );
  //         setSelectedClass(null);

  //         router.push("/tutor/payments/cancelled");
  //         return true;
  //       } else {
  //         const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  //         const mins = Math.floor((diff / 1000 / 60) % 60);
  //         const secs = Math.floor((diff / 1000) % 60);
  //         setTimeLeft(`${hours}h ${mins}m ${secs}s`);
  //         return false;
  //       }
  //     };

  //     const interval = setInterval(async () => {
  //       const expired = await checkDeadline();
  //       if (expired) clearInterval(interval);
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }, [selectedClass]);

  /* =========================================================
     💰 Thanh toán online 25%
  ========================================================= */
  const markPaid = async (id) => {
    if (!confirm("Xác nhận thanh toán online 25% học phí?")) return;

    try {
      const selected = classes.find((c) => c.class_id === id);
      const total =
        (selected.tuition_amount || 0) *
        (selected.sessions_per_week || 1) *
        (selected.weeks || 1);
      const deposit = total * 0.25;
      const amount = deposit * 1000; // Giá trị VNĐ thật

      const res = await api.post("/payments/stripe", {
        class_id: id,
        amount,
        subject: selected.subject || "Lớp học DạyThêm",
      });
      console.log("🔍 Stripe response:", res.data);
      if (res.data.success) {
        window.location.href = res.data.url;
      } else {
        alert("❌ Không thể tạo phiên thanh toán Stripe!");
      }
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      alert("Lỗi khi khởi tạo thanh toán online!");
    }
  };

  /* =========================================================
     🚫 Hủy thanh toán thủ công
  ========================================================= */
  const cancelPayment = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy thanh toán này?")) return;
    try {
      const res = await api.put(`/classes/${id}/cancel-payment`);
      if (res.data.success) {
        alert("🚫 Đã hủy thanh toán!");
        setClasses((prev) => prev.filter((c) => c.class_id !== id));
        setSelectedClass(null);
      }
    } catch {
      alert("❌ Lỗi khi hủy thanh toán!");
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500">
        ⏳ Đang tải danh sách lớp cần thanh toán...
      </div>
    );

  /* =========================================================
     🖥️ Giao diện chính
  ========================================================= */
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <SidebarTutor />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <TopbarTutor />
        <main className="flex-1 p-6 mt-[70px]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            {/* ✅ Cột trái - danh sách lớp */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                💰 Lớp cần thanh toán (Cọc 25%)
              </h2>

              {classes.length === 0 ? (
                <div className="text-gray-500 italic text-center">
                  ✅ Không có lớp nào đang chờ thanh toán.
                </div>
              ) : (
                classes.map((cls) => {
                  const total =
                    (cls.tuition_amount || 0) *
                    (cls.sessions_per_week || 1) *
                    (cls.weeks || 1);
                  const deposit = total * 0.25;

                  return (
                    <div
                      key={cls.class_id}
                      onClick={() => setSelectedClass(cls)}
                      className={`cursor-pointer mb-5 p-5 bg-white rounded-2xl shadow-md border hover:shadow-lg transition ${
                        selectedClass?.class_id === cls.class_id
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl">
                          👩‍🎓
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-blue-800">
                            Học tại nhà - TN{cls.class_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Môn học: {cls.subject} | Lớp:{" "}
                            {cls.grade || "Không rõ"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số tuần học: {cls.weeks || 1} •{" "}
                            {cls.sessions_per_week || 1} buổi/tuần
                          </p>
                          <p className="font-semibold text-gray-800">
                            💵 Học phí gốc:{" "}
                            {Number(total * 1000).toLocaleString("vi-VN")} VNĐ
                          </p>
                          <p className="font-semibold text-green-600">
                            💰 Cần thanh toán (25%):{" "}
                            {Number(deposit * 1000).toLocaleString("vi-VN")} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ✅ Cột phải - chi tiết thanh toán */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                💳 Thanh toán dịch vụ
              </h2>

              {selectedClass ? (
                (() => {
                  const total =
                    (selectedClass.tuition_amount || 0) *
                    (selectedClass.sessions_per_week || 1) *
                    (selectedClass.weeks || 1);
                  const deposit = total * 0.25;
                  const paymentReal = deposit * 1000;

                  return (
                    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
                      <p className="text-gray-700 mb-2">
                        <b>Mã lớp:</b> TN{selectedClass.class_id}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <b>Môn học:</b> {selectedClass.subject}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <b>Học viên:</b>{" "}
                        {selectedClass.student_name || "Ẩn danh"}
                      </p>

                      <hr className="my-3" />

                      <div className="mt-4 border-t pt-3">
                        <p className="text-gray-700 font-medium">
                          Tổng học phí:{" "}
                          {Number(total * 1000).toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-gray-800 font-medium">
                          💰 Thanh toán 25%:{" "}
                          <span className="text-blue-700 font-bold text-2xl">
                            {Number(deposit * 1000).toLocaleString("vi-VN")} VNĐ
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          (Giá trị thực gửi API: <b>{paymentReal}</b> VNĐ)
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3">
                        <button
                          onClick={() => markPaid(selectedClass.class_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                        >
                          💰 Thanh toán 25%
                        </button>
                        <button
                          onClick={() => cancelPayment(selectedClass.class_id)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                        >
                          🚫 Hủy thanh toán
                        </button>
                      </div>

                      <div className="mt-6 text-sm text-gray-500 border-t pt-3">
                        Số dư ví hiện tại:{" "}
                        <b className="text-green-600">
                          {walletBalance.toLocaleString("vi-VN")} VNĐ
                        </b>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-gray-500 italic text-center py-10">
                  👈 Chọn một lớp ở danh sách bên trái để xem chi tiết thanh
                  toán
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
