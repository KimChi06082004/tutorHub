// src/components/Footer.js
"use client";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Danh sách ngành học */}
        <div className="footer-column">
          <h4>Ngành học</h4>
          <ul className="footer-list">
            <li>Ngành ngoại ngữ</li>
            <li>Ngành lập trình</li>
            <li>Ngành âm nhạc</li>
            <li>Ngành sức khỏe</li>
            <li>Ngành tài chính</li>
            <li>Ngành ẩm thực</li>
            <li>Ngành thể thao</li>
            <li>Ngành phổ thông 1</li>
            <li>Ngành đồ họa</li>
            <li>Ngành võ thuật</li>
            <li>Ngành làm đẹp</li>
            <li>Ngành marketing</li>
            <li>Ngành nuôi trồng</li>
            <li>Ngành bán hàng</li>
          </ul>
        </div>

        {/* Câu hỏi thường gặp */}
        <div className="footer-column">
          <h4>Những câu hỏi thường gặp</h4>
          <ul className="footer-list">
            <li>Làm sao để thực hiện tính năng nạp tiền, rút tiền?</li>
            <li>Để thanh toán lớp học trên hệ thống thì phải làm sao?</li>
            <li>Làm sao để có thể khiếu nại người dạy hoặc người học?</li>
            <li>
              Cho tôi hỏi làm thế nào để tạo một lớp học trên hệ thống của bạn?
            </li>
          </ul>
        </div>

        {/* Khiếu nại + Hotline */}
        <div className="footer-column">
          <h4>Khung khiếu nại</h4>
          <textarea
            placeholder="Nội dung khiếu nại..."
            rows={3}
            className="footer-textarea"
          ></textarea>
          <button className="btn">Gửi khiếu nại</button>

          <div className="hotline">
            📞 Hotline hỗ trợ: <b>1900-123-456</b>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 DayThem App – All rights reserved.
      </div>
    </footer>
  );
}
