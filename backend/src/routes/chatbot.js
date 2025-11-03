import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken"; // ⚙️ cần thêm để đọc token nếu có

const router = express.Router();
const cache = new Map();

/* =========================================================
   🤖 Chatbot hỗ trợ DạyThêm.com (Gemini Flash)
   - Phân biệt role: student / tutor / admin / guest
   - Hoạt động cả khi chưa đăng nhập
========================================================= */
router.post("/", async (req, res) => {
  try {
    const { question, role } = req.body;

    if (!question || typeof question !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu hoặc sai định dạng câu hỏi." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res
        .status(500)
        .json({ success: false, message: "Thiếu GEMINI_API_KEY trong .env" });

    // ✅ 1️⃣ Kiểm tra token thủ công (nếu có)
    let user = null;
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        user = jwt.verify(token, process.env.JWT_SECRET);
      }
    } catch (err) {
      // Không có token hoặc token sai → bỏ qua (guest)
    }

    // Nếu không có role → mặc định là guest
    const userRole = role || user?.role || "guest";

    // ❌ 2️⃣ Admin không được phép dùng chatbot
    if (userRole === "admin") {
      return res.json({
        success: false,
        answer: "Chatbot không khả dụng cho tài khoản admin.",
      });
    }

    const lowerQ = question.toLowerCase();

    /* =========================================================
       🧩 STUDENT hỏi về tạo CV / hồ sơ gia sư → chặn chi tiết
    ========================================================= */
    const tutorKeywords = [
      "cv",
      "hồ sơ",
      "tạo hồ sơ",
      "làm hồ sơ",
      "nộp hồ sơ",
      "cập nhật hồ sơ",
      "đăng ký gia sư",
      "đăng ký làm gia sư",
      "đăng ký dạy",
      "ứng tuyển",
      "tạo cv",
      "cập nhật cv",
      "điền thông tin gia sư",
      "hồ sơ dạy",
      "hướng dẫn tạo hồ sơ dạy",
      "hướng dẫn tạo cv",
      "trở thành gia sư",
    ];

    if (
      userRole === "student" &&
      tutorKeywords.some((kw) => lowerQ.includes(kw))
    ) {
      return res.json({
        success: true,
        answer:
          "Bạn không phải gia sư, vui lòng tạo tài khoản là gia sư để cập nhật CV hoặc hồ sơ giảng dạy.",
      });
    }

    /* =========================================================
       🧩 TUTOR hỏi về tạo lớp → chặn chi tiết
    ========================================================= */
    const classKeywords = [
      "tạo lớp",
      "đăng lớp",
      "đăng tuyển lớp",
      "hướng dẫn tạo lớp",
      "hướng dẫn đăng lớp",
      "hướng cách tạo lớp",
      "cách tạo lớp",
      "cách đăng lớp",
      "tạo lớp mới",
      "hướng dẫn tạo lớp học",
    ];

    if (
      userRole === "tutor" &&
      classKeywords.some((kw) => lowerQ.includes(kw))
    ) {
      return res.json({
        success: true,
        answer:
          "Bạn không phải học viên, vui lòng tạo tài khoản là học viên để đăng lớp.",
      });
    }

    /* =========================================================
       🧠 Nếu hợp lệ → xử lý bằng Gemini API
    ========================================================= */
    const GEMINI_ENDPOINT =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const promptText = `
Bạn là chatbot hỗ trợ người dùng trên website DayThem — nền tảng kết nối giữa học viên (student) và gia sư (tutor).

QUY TRÌNH HOẠT ĐỘNG CỦA WEBSITE:
- Học viên (student) là người tạo lớp học để tìm gia sư.
- Gia sư (tutor) chỉ có thể xem và ứng tuyển vào lớp học mà học viên đã đăng.
- Admin phê duyệt lớp học và hồ sơ gia sư trước khi hiển thị công khai.
- Học phí được thanh toán qua hệ thống.

HƯỚNG DẪN TRẢ LỜI:
1. Nếu người dùng hỏi về cách tạo lớp học:
   "Trên daythem, chỉ học viên (student) mới có thể tạo lớp để tìm gia sư.
    Bạn hãy:
    - Đăng nhập bằng tài khoản học viên.
    - Nhấn 'Đăng tuyển lớp'.
    - Điền thông tin như môn học, cấp lớp, lịch học, học phí, địa chỉ.
    - Gửi yêu cầu để admin duyệt.
    Sau khi được duyệt, gia sư có thể xem và ứng tuyển dạy lớp của bạn nhé."

2. Nếu người dùng hỏi về cách tạo CV hoặc hồ sơ gia sư:
   "Để tạo CV hồ sơ gia sư, bạn hãy:
    - Đăng nhập vào tài khoản gia sư (tutor).
    - Nhấn 'Cập nhật CV' hoặc 'Hồ sơ của tôi'.
    - Điền các thông tin cần thiết như: họ tên, trường học, chuyên ngành, kinh nghiệm, chứng chỉ, ảnh và mô tả ngắn.
    - Sau khi hoàn tất, nhấn 'Gửi' để chờ admin duyệt.
    Sau khi được duyệt, học viên có thể xem hồ sơ của bạn để chọn dạy."

3. Nếu câu hỏi ngoài phạm vi (như thời tiết, giải trí, phim ảnh...):
   "Xin lỗi, tôi chỉ hỗ trợ các vấn đề liên quan đến hệ thống dạy thêm."

4. Không dùng ký tự **, *, hoặc định dạng Markdown.
Trả lời thân thiện, ngắn gọn, chính xác theo vai trò của người hỏi.

Câu hỏi: ${question}
`;

    // ⚙️ Cache tránh gọi API lặp
    const cacheKey = `${userRole}:${question.trim().toLowerCase()}`;
    if (cache.has(cacheKey)) {
      console.log("⚡ Cache hit:", cacheKey);
      return res.json({ success: true, answer: cache.get(cacheKey) });
    }

    // 🕒 Timeout + Retry
    let data;
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        data = await response.json();

        if (data?.error?.message?.includes("overloaded")) {
          console.warn(`⚠️ Gemini quá tải (lần thử ${attempt})`);
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        break;
      } catch (err) {
        clearTimeout(timeout);
        if (attempt === maxRetries) throw err;
        console.warn(`🔁 Lỗi gọi Gemini (lần ${attempt})`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // 🧹 Làm sạch text
    let answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.";
    answer = answer
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/_+/g, "")
      .replace(/#+/g, "")
      .replace(/`+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    cache.set(cacheKey, answer);
    if (cache.size > 50) cache.delete(cache.keys().next().value);

    res.json({ success: true, answer });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    if (err.name === "AbortError") {
      return res.json({
        success: true,
        answer: "⏱️ Hệ thống phản hồi chậm, vui lòng thử lại sau vài giây.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi server chatbot.",
    });
  }
});

export default router;
