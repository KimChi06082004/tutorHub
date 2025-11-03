-- Kiểm tra cấu trúc bảng students
DESCRIBE students;

-- Kiểm tra dữ liệu mẫu
SELECT * FROM students LIMIT 5;

-- Kiểm tra relationship giữa users và students
SELECT 
  u.user_id,
  u.full_name,
  u.role,
  s.student_id
FROM users u
LEFT JOIN students s ON u.user_id = s.user_id
WHERE u.role = 'student'
LIMIT 5;

-- Nếu students không có user_id, kiểm tra cách khác
SELECT * FROM students WHERE student_id IN (
  SELECT student_id FROM classes LIMIT 5
);
