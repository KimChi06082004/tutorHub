import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, otp, new_password } = req.body;
    
    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Chuyển tiếp request đến backend API
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await axios.post(`${API_BASE}/auth/reset-password`, {
      email,
      otp,
      new_password,
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Reset password proxy error:", err.message);
    
    // Trả về lỗi từ backend hoặc lỗi chung
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa." 
      });
    }
  }
}
