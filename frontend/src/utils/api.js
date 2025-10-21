// frontend/src/utils/api.js
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/* =========================================================
   ✅ REQUEST INTERCEPTOR — GẮN TOKEN TỰ ĐỘNG
========================================================= */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("⚠️ Không tìm thấy token trong localStorage");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   ⚡ RESPONSE INTERCEPTOR — TỰ LÀM MỚI TOKEN KHI 401
========================================================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (token hết hạn)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("⚠️ Không có refresh token → buộc đăng nhập lại");
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        if (newAccessToken) {
          // Lưu token mới
          localStorage.setItem("accessToken", newAccessToken);

          // Gắn lại header và gửi request cũ
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh token thất bại:", refreshError);
        // Xóa token cũ
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authToken");
        // Chuyển hướng login
        if (typeof window !== "undefined") {
          alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          window.location.href = "/login";
        }
      }
    }

    // Nếu không phải lỗi 401
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
