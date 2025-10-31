"use client";
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

export default function Chatbot({ role = "guest", userName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Tự động cuộn xuống cuối khi có tin nhắn
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Gửi tin nhắn
  const sendMessage = async () => {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: question }]);
    setLoading(true);

    try {
      const res = await api.post("/chatbot", { question, role });
      const reply =
        res.data.answer || "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error("❌ Chatbot frontend error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Lỗi server, vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  // ✅ Nhấn Enter để gửi
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🚫 Đặt ở đây — sau hook, tránh vi phạm quy tắc
  if (role === "admin") return null;

  return (
    <>
      {/* 🔘 Nút bật/tắt chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          title="Chat với trợ lý DạyThêm"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="rounded-full w-16 h-16 object-cover"
          >
            <source src="/videos/chatbot-avatar.mp4" type="video/mp4" />
          </video>
        </button>
      )}

      {/* 🧠 Cửa sổ Chatbot */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-2xl border border-gray-300 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              >
                <source src="/videos/chatbot-avatar.mp4" type="video/mp4" />
              </video>
              <div>
                <p className="font-semibold text-sm">Hỗ trợ DạyThêm</p>
                <p className="text-xs opacity-80">Trợ lý AI trực tuyến</p>
              </div>
            </div>

            {/* ❌ Nút đóng */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-lg font-bold hover:opacity-80"
            >
              ✕
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="p-3 h-64 overflow-y-auto text-sm whitespace-pre-line bg-gray-50">
            {messages.length === 0 && (
              <p className="text-gray-500 italic text-center mt-20">
                👋 Xin chào {userName || (role === "tutor" ? "Gia sư" : "bạn")}!
                <br />
                Mình là chatbot hỗ trợ DạyThêm.
                <br />
                Bạn có thể hỏi: “Cách tạo lớp học”, “Cách cập nhật CV gia sư”,
                ...
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`my-2 ${
                  m.from === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg max-w-[85%] break-words ${
                    m.from === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}

            {loading && (
              <p className="italic text-gray-400 text-center mt-2">
                Đang soạn câu trả lời...
              </p>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập */}
          <div className="flex border-t">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              maxLength={300}
              className="flex-1 p-2 text-sm outline-none resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-3 text-white text-sm font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
