# 🔧 Sửa lỗi 500 - Trang danh sách gia sư ứng tuyển

## ❌ Vấn đề:
Bảng `students` trong database có thể **KHÔNG CÓ cột `user_id`**, hoặc quan hệ giữa `students` và `users` khác với dự đoán ban đầu.

## ✅ Giải pháp áp dụng:

### 1. **Route GET `/api/requests`** (dòng 351-416)

**Giả định:** `classes.student_id = users.user_id` (student_id là user_id của học viên)

**Query cho student:**
```sql
SELECT r.*, c.*, u.full_name AS tutor_name
FROM requests r
JOIN classes c ON r.class_id = c.class_id
LEFT JOIN tutors t ON r.tutor_id = t.tutor_id
LEFT JOIN users u ON t.user_id = u.user_id
WHERE c.student_id = ?  -- ✅ So sánh trực tiếp với user_id
```

**Không còn JOIN với bảng `students`!**

### 2. **Route PUT `/api/requests/:id/respond`** (dòng 451-544)

**Query kiểm tra quyền:**
```sql
SELECT r.tutor_id, r.class_id
FROM requests r
JOIN classes c ON r.class_id = c.class_id
WHERE r.request_id = ? AND c.student_id = ?  -- ✅ So sánh trực tiếp
```

**Không còn JOIN với bảng `students`!**

---

## 🚀 Restart Backend:

```bash
cd backend
# Nhấn Ctrl+C
npm run dev
```

---

## 📊 Kiểm tra Backend Log:

Khi vào trang "Gia sư ứng tuyển":

```
✅ Fetching requests for: { role: 'student', user_id: 123 }
🔍 Executing query for role: student
✅ Found requests: 5
```

Nếu lỗi, sẽ thấy:
```
❌ Get requests error: Error: ...
❌ SQL Message: Unknown column 'students.user_id' ...
```

---

## 🔍 Nếu vẫn lỗi:

### **Kiểm tra database schema:**

Chạy SQL này trong MySQL/phpMyAdmin:

```sql
-- 1. Xem cấu trúc bảng students
DESCRIBE students;

-- 2. Xem cấu trúc bảng classes
DESCRIBE classes;

-- 3. Kiểm tra relationship
SELECT 
  c.class_id,
  c.student_id,
  u.user_id,
  u.full_name,
  u.role
FROM classes c
JOIN users u ON c.student_id = u.user_id
WHERE u.role = 'student'
LIMIT 5;
```

### **3 trường hợp có thể xảy ra:**

**A. `students` có `user_id`:**
- Bảng `students` có cột `user_id` liên kết với `users.user_id`
- Cần sửa lại query JOIN qua `students.user_id`

**B. `students.student_id = users.user_id`:**
- Bảng `students` có `student_id` chính là `user_id`
- **Code hiện tại đã xử lý trường hợp này** ✅

**C. Không có bảng `students`:**
- Chỉ có bảng `users` với role='student'
- **Code hiện tại đã xử lý trường hợp này** ✅

---

## 🎯 Test thử:

1. **Login với tài khoản student**
2. **Vào trang: `/student/tutor-requests`**
3. **Kiểm tra:**
   - ✅ Trang load được (không lỗi 500)
   - ✅ Hiển thị danh sách gia sư ứng tuyển
   - ✅ Có nút "Đồng ý" / "Từ chối"

4. **Click "Đồng ý":**
   - Backend log: `✅ Student responding to request: ...`
   - ✅ Không còn lỗi 500

---

## 📝 Ghi chú:

- Nếu code mới vẫn lỗi, **COPY TOÀN BỘ backend log** và gửi lại
- Log sẽ hiển thị chính xác lỗi SQL là gì
- Có thể cần điều chỉnh query dựa trên cấu trúc database thực tế

---

**Restart backend ngay và test lại!** 🚀
