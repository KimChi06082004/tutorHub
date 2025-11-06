// import { useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";
// import Link from "next/link";
// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();

//   // 👉 BASE_URL để gọi đúng backend (tránh lỗi 500/CORS)
//   const API_BASE =
//     process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setLoading(true);

//     try {
//       // ✅ Gọi trực tiếp API backend
//       const res = await axios.post(`${API_BASE}/api/auth/send-otp`, { email });

//       // ✅ Thông báo phản hồi
//       setMessage(res.data.message || "OTP đã được gửi đến email!");
//       console.log("Send OTP response:", res.data);

//       // ✅ Chuyển sang trang reset-password sau 2 giây
//       setTimeout(() => {
//         router.push("/reset-password");
//       }, 2000);
//     } catch (err) {
//       console.error("Send OTP error:", err);
//       setError(
//         err.response?.data?.message ||
//           "Không thể gửi OTP. Vui lòng kiểm tra backend hoặc EmailJS key!"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-6 rounded-lg shadow-md w-80">
//         <h1 className="text-xl font-bold mb-4 text-center">Quên mật khẩu</h1>

//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             placeholder="Nhập email của bạn"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="border p-2 rounded mb-3 w-full"
//             required
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 rounded text-white ${
//               loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
//             }`}
//           >
//             {loading ? "Đang gửi..." : "Gửi mã OTP"}
//           </button>
//         </form>

//         {/* ✅ Hiển thị kết quả */}
//         {message && (
//           <p className="mt-3 text-green-600 text-center font-medium">
//             {message}
//           </p>
//         )}
//         {error && (
//           <p className="mt-3 text-red-600 text-center font-medium">{error}</p>
//         )}

//         <Link href="/login" className="text-gray-500 text-sm underline">
//           Quay lại đăng nhập
//         </Link>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/send-otp`, { email });
      setMessage(res.data.message || "OTP đã được gửi đến email!");
      console.log("Send OTP response:", res.data);

      setTimeout(() => {
        router.push("/reset-password");
      }, 2000);
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Không thể gửi OTP. Vui lòng kiểm tra backend hoặc EmailJS key!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.02]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#003366] flex items-center justify-center gap-2">
          Quên mật khẩu
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-gray-600 font-medium">
            Địa chỉ email
          </label>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 rounded-lg mb-4 w-full transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>

        {/* ✅ Hiển thị kết quả */}
        {message && (
          <p className="mt-5 text-green-600 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 text-red-600 text-center font-medium">{error}</p>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
