// export const requireRoles =
//   (...roles) =>
//   (req, res, next) => {
//     if (!req.user)
//       return res
//         .status(401)
//         .json({ success: false, message: "Unauthenticated" });
//     if (!roles.includes(req.user.role))
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     next();
//   };
// middlewares/roles.js
//// export { requireRole as requireRoles } from "./auth.js";
// ✅ Middleware kiểm tra vai trò người dùng
export const requireRoles = (allowedRoles = []) => {
  // Cho phép truyền chuỗi đơn hoặc mảng
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập." });
    }

    next();
  };
};
