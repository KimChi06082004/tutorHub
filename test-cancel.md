# Test Cancel Class API

## ✅ Đã sửa (Cancel Class):

1. **Di chuyển route `/:id/cancel` lên trước route `/:id`**
2. **Xóa route `/mine` duplicate**
3. **Thêm nhiều console.log để debug**
4. **Bỏ qua lỗi notification nếu có**

---

## ✅ Đã sửa (Tutor Requests - Mới):

### 🐛 **Lỗi trong `/requests` GET endpoint:**

**Vấn đề:**
- Query JOIN với bảng `students` nhưng bảng này không có cột `user_id`
- Gây lỗi 500 khi học viên xem danh sách gia sư ứng tuyển

**Giải pháp:**
- Sửa query để JOIN đúng qua bảng `classes` 
- Lấy `student_id` từ `user_id` thông qua subquery
- Thêm thông tin gia sư (tên, avatar) vào response

### 🐛 **Lỗi trong `/requests/:id/respond` PUT endpoint:**

**Vấn đề:**
- Gửi notification với `tutor_id` thay vì `user_id` của gia sư
- Không kiểm tra quyền của student trước khi phản hồi
- Không cập nhật lớp khi APPROVED

**Giải pháp:**
- Kiểm tra request thuộc về student hiện tại
- Lấy `user_id` của gia sư để gửi notification
- Cập nhật `selected_tutor_id` và status của lớp khi APPROVED
- Thêm console.log để debug

---

## 🔧 Restart Backend:

```bash
cd backend
# Ctrl+C để dừng server cũ
npm run dev
```

## 📋 Kiểm tra Backend Log:

### Khi xem danh sách gia sư ứng tuyển:
```
GET /api/requests
✅ Trả về danh sách với tutor_name, tutor_avatar
```

### Khi đồng ý/từ chối gia sư:
```
✅ Student responding to request: { id: 123, status: 'APPROVED', user_id: 456 }
✅ Request found: { tutor_id: 789, class_id: 101 }
✅ Class updated with tutor: 789
✅ Notification sent to tutor
```

## ❌ Nếu vẫn lỗi 500:

Kiểm tra backend terminal để xem log chi tiết:
- Có thể bảng `students` không có `user_id`
- Có thể relationship giữa `students` và `users` không đúng

## 🎯 Nếu thành công:

- Học viên xem được danh sách gia sư ứng tuyển
- Click "Đồng ý" → Gia sư được chọn, lớp chuyển sang IN_PROGRESS
- Click "Từ chối" → Request status chuyển sang REJECTED
- Gia sư nhận được thông báo

