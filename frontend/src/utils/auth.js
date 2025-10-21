// Lấy thông tin user từ localStorage
export const getAuthUser = () => {
  if (typeof window === "undefined") return null; // tránh lỗi SSR
  try {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Parse user error:", err);
    return null;
  }
};

// Lấy token từ localStorage
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
};

// Lưu user + token vào localStorage
export const setAuthUser = (user, token) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("Save auth error:", err);
    }
  }
};

// Xóa user + token khi logout
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};
