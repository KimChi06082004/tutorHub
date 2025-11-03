# Fix OTP Forgot Password Issue

## Vấn đề đã phát hiện

Lỗi **AxiosError - Network Error** khi gửi mã OTP quên mật khẩu do:

1. **Frontend gọi sai endpoint**: Trang `forgot-password.js` đang gọi `/api/auth/send-otp` (Next.js API route) thay vì gọi backend API `http://localhost:8080/api/auth/send-otp`

2. **Next.js API route không hoạt động đúng**: File `frontend/src/pages/api/auth/send-otp.js` cố gắng sử dụng EmailJS nhưng không có cấu hình đầy đủ và không kết nối đến backend

## Các thay đổi đã thực hiện

### 1. Sửa `frontend/src/pages/forgot-password.js`
- ✅ Thay đổi từ `fetch()` sang `axios` để gọi backend API trực tiếp
- ✅ Thêm xử lý lỗi chi tiết hơn
- ✅ Thêm loading state
- ✅ Tự động chuyển sang trang reset-password sau khi gửi OTP thành công

### 2. Sửa `frontend/src/pages/reset-password.js`  
- ✅ Thay đổi từ `fetch()` sang `axios` để gọi backend API trực tiếp
- ✅ Thêm xử lý lỗi riêng biệt
- ✅ Tự động chuyển về trang login sau khi đổi mật khẩu thành công

### 3. Tạo `backend/create-otp-table.sql`
- ✅ Script SQL để tạo bảng `password_reset_otps` nếu chưa có

## Cách sử dụng

### 1. Tạo bảng database (nếu chưa có)
```sql
mysql -u root -p websitedaythem < backend/create-otp-table.sql
```

### 2. Khởi động backend
```bash
cd backend
npm start
```

### 3. Khởi động frontend
```bash
cd frontend
npm run dev
```

### 4. Test chức năng quên mật khẩu
1. Truy cập: http://localhost:3000/forgot-password
2. Nhập email đã đăng ký
3. Nhấn "Gửi mã OTP"
4. Kiểm tra email để lấy mã OTP (6 chữ số)
5. Trang sẽ tự động chuyển sang reset-password
6. Nhập email, OTP và mật khẩu mới
7. Nhấn "Đặt lại mật khẩu"
8. Đăng nhập với mật khẩu mới

## Cấu trúc API

### Backend endpoints đã sẵn có:
- `POST /api/auth/send-otp` - Gửi mã OTP qua email
- `POST /api/auth/verify-otp` - Xác minh mã OTP
- `POST /api/auth/reset-password` - Đặt lại mật khẩu mới

### EmailJS đã được cấu hình:
- Service ID: `service_4f00h6i`
- Template ID: `template_cpjih3n`  
- Public Key: `4H_tEdckHd6-_Ya9Z`

## Lưu ý
- Mã OTP có hiệu lực trong 5 phút
- Mã OTP được lưu trong bảng `password_reset_otps`
- Sau khi đổi mật khẩu thành công, OTP sẽ bị xóa khỏi database
