import { useState } from "react";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpData = globalThis?.otpStore?.[email];

    if (!otpData) return setMsg("Không tìm thấy OTP cho email này");
    if (Date.now() > otpData.expires) return setMsg("OTP đã hết hạn");
    if (otpData.code != otp) return setMsg("OTP không chính xác");

    setMsg("✅ Xác thực thành công! Tiến hành đổi mật khẩu");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-xl font-bold mb-4">Xác minh OTP</h1>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded mb-3 w-64"
          required
        />
        <input
          type="text"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 rounded mb-3 w-64"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Xác minh
        </button>
      </form>
      {msg && <p className="mt-3 text-blue-600">{msg}</p>}
    </div>
  );
}
