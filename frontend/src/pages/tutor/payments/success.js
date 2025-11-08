import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function PaymentSuccess() {
  const router = useRouter();
  const { class_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!class_id) return;

    const updateClassStatus = async () => {
      try {
        const res = await api.put(
          `/classes/${class_id}/confirm-payment-public`
        );
        if (res.data.success) {
          alert(" Thanh toán thành công! Lớp đã được kích hoạt.");
          router.push("/tutor/classes/active"); // 👉 chuyển đến trang “Lớp đang dạy”
        } else {
          alert(" Không thể cập nhật trạng thái lớp!");
        }
      } catch (err) {
        console.error(" Lỗi xác nhận thanh toán:", err);
      } finally {
        setLoading(false);
      }
    };

    updateClassStatus();
  }, [class_id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">⏳ Đang xử lý thanh toán...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Thanh toán thành công!
      </h1>
      <p className="text-gray-600">
        Hệ thống đã cập nhật lớp vào danh sách “Đang dạy”.
      </p>
    </div>
  );
}
