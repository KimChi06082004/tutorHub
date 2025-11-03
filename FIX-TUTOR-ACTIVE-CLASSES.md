# ✅ Sửa lỗi 404 - Trang lớp đang dạy (Tutor Active Classes)

## ❌ Vấn đề:
Frontend gọi `/api/classes/tutor/active` nhưng route này **KHÔNG TỒN TẠI** trong backend.

## ✅ Giải pháp:
Đã thêm route mới `/api/classes/tutor/active` vào `backend/src/routes/classes.js`

## 📝 Chi tiết:

### Route đã thêm (dòng 869-918):

```javascript
router.get("/tutor/active", verifyToken, requireRoles(["tutor"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    
    const query = `
      SELECT 
        c.class_id, 
        c.subject, 
        c.grade, 
        c.schedule, 
        c.tuition_amount,
        c.city, 
        c.district,
        c.ward,
        c.address,
        c.status,
        c.payment_status,
        c.start_date,
        c.end_date,
        u.full_name AS student_name, 
        u.email AS student_email
      FROM classes c
      JOIN users u ON u.user_id = c.student_id
      WHERE c.selected_tutor_id = (SELECT tutor_id FROM tutors WHERE user_id=?)
        AND c.payment_status='PAID'
        AND c.status IN ('IN_PROGRESS', 'APPROVED_VISIBLE')
      ORDER BY c.start_date DESC
    `;

    const [rows] = await pool.query(query, [user_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get tutor active classes error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.sqlMessage || "Lỗi khi tải danh sách lớp đang dạy." 
    });
  }
});
```

### Điều kiện lọc:

1. ✅ `selected_tutor_id` khớp với tutor hiện tại
2. ✅ `payment_status = 'PAID'` - Đã thanh toán
3. ✅ `status IN ('IN_PROGRESS', 'APPROVED_VISIBLE')` - Đang dạy hoặc đã duyệt

### Dữ liệu trả về:

- Thông tin lớp: `class_id`, `subject`, `grade`, `schedule`, `tuition_amount`
- Địa chỉ: `city`, `district`, `ward`, `address`
- Trạng thái: `status`, `payment_status`
- Thời gian: `start_date`, `end_date`
- Thông tin học viên: `student_name`, `student_email`

---

## 🚀 Restart Backend:

```bash
cd backend
# Ctrl+C
npm run dev
```

---

## 📊 Kiểm tra Backend Log:

Khi gia sư vào trang "Lớp đang dạy":

```
✅ Fetching active classes for tutor: 123
✅ Found active classes: 5
```

---

## 🎯 Test:

1. **Login với tài khoản tutor**
2. **Vào trang: `/tutor/classes/active`**
3. **Kết quả:**
   - ✅ Không còn lỗi 404
   - ✅ Hiển thị danh sách lớp đã thanh toán
   - ✅ Hiển thị lịch học, thông tin học viên
   - ✅ Click vào lớp để xem chi tiết

---

## 📝 Lưu ý:

- Route này **CHỈ cho gia sư** (requireRoles["tutor"])
- Chỉ hiển thị lớp **ĐÃ THANH TOÁN** (payment_status='PAID')
- Chỉ hiển thị lớp **ĐANG DẠY** hoặc **ĐÃ DUYỆT**

---

**Restart backend và test ngay!** 🚀
