# Hướng dẫn sửa lỗi OTP 500

## Lỗi hiện tại
```
AxiosError: Request failed with status code 500
```

## Các bước khắc phục

### Bước 1: Kiểm tra backend có đang chạy không

Mở terminal và chạy:
```bash
cd backend
npm start
```

Hoặc dùng nodemon:
```bash
cd backend
npm run dev
```

Backend phải hiển thị:
```
✅ Server running at http://localhost:8080
```

### Bước 2: Tạo bảng password_reset_otps trong database

**Cách 1: Dùng script tự động**
```bash
fix-database.bat
```

**Cách 2: Thủ công**
```bash
mysql -u root -p websitedaythem
```

Sau đó chạy SQL:
```sql
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires (expires_at)
);
```

### Bước 3: Kiểm tra file .env có đầy đủ thông tin không

File `backend/.env` phải có:
```env
EMAILJS_SERVICE_ID=service_4f00h6i
EMAILJS_TEMPLATE_ID=template_cpjih3n
EMAILJS_PUBLIC_KEY=4H_tEdckHd6-_Ya9Z

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=websitedaythem
```

### Bước 4: Test backend API trực tiếp

```bash
node test-backend.js
```

Script này sẽ gọi API trực tiếp và hiển thị lỗi chi tiết.

### Bước 5: Xem log của backend

Khi bạn gửi OTP từ frontend, hãy xem terminal backend. Nó sẽ hiển thị:
```
Sending OTP via EmailJS to: xxx@example.com
Service ID: service_4f00h6i
Template ID: template_cpjih3n
Public Key: Set
```

Nếu có lỗi, backend sẽ hiển thị chi tiết lỗi.

## Các lỗi thường gặp

### Lỗi 1: Table không tồn tại
```
Error: Table 'websitedaythem.password_reset_otps' doesn't exist
```
**Giải pháp:** Chạy Bước 2

### Lỗi 2: EmailJS credentials sai
```
Error: Invalid public key
```
**Giải pháp:** Kiểm tra lại credentials trong .env

### Lỗi 3: Backend không chạy
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Giải pháp:** Chạy Bước 1

### Lỗi 4: Database không kết nối được
```
Error: Access denied for user 'root'@'localhost'
```
**Giải pháp:** Kiểm tra MySQL đang chạy và password đúng

## Sau khi sửa

1. Restart backend: `Ctrl+C` rồi `npm start`
2. Refresh trang frontend: `F5`
3. Thử gửi OTP lại

## Kiểm tra cuối cùng

Test flow hoàn chỉnh:
1. Mở http://localhost:3000/forgot-password
2. Nhập email hợp lệ
3. Click "Gửi mã OTP"
4. Kiểm tra backend console có log "Sending OTP via EmailJS"
5. Kiểm tra email nhận được OTP
6. Trang tự động chuyển sang /reset-password
7. Nhập email, OTP và mật khẩu mới
8. Đặt lại mật khẩu thành công
