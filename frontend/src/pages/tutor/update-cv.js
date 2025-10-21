import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopbarTutor from "../../components/TopbarTutor";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function UpdateCV() {
  const [step, setStep] = useState(1);

  // ✅ Dữ liệu form
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    bio: "",
    education_level: "",
    major: "",
    university: "",
    experience: "",
    gender: "",
    cccd: "",
  });

  const [avatar, setAvatar] = useState("");
  const [cccdFront, setCccdFront] = useState("");
  const [cccdBack, setCccdBack] = useState("");
  const [certificates, setCertificates] = useState([]);

  // ✅ Load từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorCVData");
    if (saved) {
      const data = JSON.parse(saved);
      setFormData(data.formData || {});
      setAvatar(data.avatar || "");
      setCccdFront(data.cccdFront || "");
      setCccdBack(data.cccdBack || "");
      setCertificates(data.certificates || []);
    }
  }, []);

  // ✅ Lưu tự động
  useEffect(() => {
    const data = { formData, avatar, cccdFront, cccdBack, certificates };
    localStorage.setItem("tutorCVData", JSON.stringify(data));
  }, [formData, avatar, cccdFront, cccdBack, certificates]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => setStep((s) => Math.min(5, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  // ===== Upload helper =====
  const handleImageUpload = async (e, setter, multiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && certificates.length + files.length > 5) {
      alert("❌ Chỉ được upload tối đa 5 ảnh chứng chỉ!");
      return;
    }

    const formData = new FormData();
    if (multiple) Array.from(files).forEach((f) => formData.append("files", f));
    else formData.append("file", files[0]);

    try {
      const res = await fetch(
        `${API_BASE}/upload/${multiple ? "multiple" : "single"}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data.success) throw new Error("Upload thất bại");

      if (multiple) {
        setter((prev) => [
          ...prev,
          ...data.urls.map((u) => `${API_BASE.replace("/api", "")}${u}`),
        ]);
      } else {
        setter(`${API_BASE.replace("/api", "")}${data.filePath}`);
      }
    } catch (err) {
      alert("❌ Lỗi upload: " + err.message);
    }
  };

  // ===== Gửi hồ sơ =====
  const handleSubmitCV = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      alert("⚠️ Bạn cần đăng nhập trước khi gửi hồ sơ!");
      return;
    }

    const payload = {
      ...formData,
      avatar,
      cccd_front: cccdFront,
      cccd_back: cccdBack,
      certificates,
    };

    try {
      const res = await fetch(`${API_BASE}/tutors/submit-cv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Gửi thành công – chờ admin duyệt!");
        localStorage.removeItem("tutorCVData");
      } else {
        alert("❌ " + (data.message || "Gửi thất bại!"));
      }
    } catch (err) {
      alert("🚨 Lỗi hệ thống: " + err.message);
    }
  };

  return (
    <div>
      <Sidebar />
      <TopbarTutor />

      <div className="main-content bg-gray-50 min-h-screen p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">
            🧑‍🏫 Cập nhật hồ sơ gia sư
          </h2>

          {/* ===== BƯỚC 1 ===== */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700">
                👤 Thông tin cá nhân
              </h3>

              {/* Avatar nhỏ gọn */}
              <div className="flex flex-col items-center relative mt-4">
                <div className="relative w-[75px] h-[75px] rounded-full border border-blue-400 bg-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-[10px]">
                      Chưa có ảnh
                    </span>
                  )}

                  <label
                    htmlFor="avatarUpload"
                    className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full shadow-md p-[4px] cursor-pointer hover:bg-blue-50 transition"
                    title="Tải ảnh đại diện"
                  >
                    📤
                  </label>

                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setAvatar)}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-gray-600 mt-2">
                  Ảnh đại diện (rõ khuôn mặt)
                </p>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium">
                      Họ tên:
                    </label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="mt-2 w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">
                      Số CCCD:
                    </label>
                    <input
                      name="cccd"
                      value={formData.cccd}
                      onChange={handleChange}
                      type="text"
                      placeholder="123456789xxx"
                      className="mt-2 w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium">
                      Giới tính:
                    </label>
                    <div className="flex gap-6 mt-2">
                      {["Nam", "Nữ"].map((gender) => (
                        <label
                          key={gender}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={handleChange}
                            className="accent-blue-500"
                          />
                          {gender}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">
                      Năm sinh:
                    </label>
                    <input
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      type="date"
                      className="mt-2 w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* CCCD trước / sau */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[
                  {
                    label: "CCCD trước",
                    state: cccdFront,
                    setter: setCccdFront,
                  },
                  { label: "CCCD sau", state: cccdBack, setter: setCccdBack },
                ].map((item) => (
                  <div key={item.label}>
                    <label className="block font-medium text-gray-700 mb-2">
                      {item.label}:
                    </label>
                    <div className="relative w-[150px] h-[100px] border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                      {item.state ? (
                        <img
                          src={item.state}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 text-sm">
                          📷
                          <span className="text-[11px] mt-1">Được bảo mật</span>
                        </div>
                      )}
                      <label className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow-md hover:bg-blue-600">
                        +
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, item.setter)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== BƯỚC 2 ===== */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700">
                🎓 Hồ sơ học vấn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-gray-700">
                    Trình độ cao nhất:
                  </label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
                  >
                    <option value="">-- Chọn --</option>
                    <option>Cao đẳng</option>
                    <option>Đại học</option>
                    <option>Thạc sĩ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700">
                    Chuyên ngành học:
                  </label>
                  <input
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    type="text"
                    placeholder="Công nghệ thông tin"
                    className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700">
                    Trường theo học:
                  </label>
                  <input
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    type="text"
                    placeholder="Đại học Công Thương"
                    className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700">
                    Kinh nghiệm:
                  </label>
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    type="text"
                    placeholder="Sinh viên dạy kèm 2 năm"
                    className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Mô tả thêm:
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Ví dụ: Tôi có kinh nghiệm dạy kèm 3 năm..."
                  className="mt-2 border border-gray-300 rounded-lg p-3 w-full min-h-[120px]"
                />
              </div>
            </div>
          )}
          {/* ===== BƯỚC 3 ===== */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700">
                📘 Ngành dạy & Môn học
              </h3>
              <div>
                <label className="block font-medium text-gray-700">
                  Ngành dạy:
                </label>
                <div className="flex flex-wrap gap-6 mt-3">
                  {[
                    "Phổ thông",
                    "Ngoại ngữ",
                    "Đồ họa",
                    "Âm nhạc",
                    "Lập trình",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-500" />{" "}
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mt-4">
                  Môn học:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    "Toán",
                    "Văn",
                    "Anh",
                    "Lý",
                    "Hóa",
                    "Sinh",
                    "Sử",
                    "Địa",
                    "Tin học",
                    "IELTS",
                  ].map((subject) => (
                    <label key={subject} className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-500" />{" "}
                      {subject}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* ===== BƯỚC 4 ===== */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700">📑 Chứng chỉ</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setCertificates, true)}
                className="mt-2 border rounded p-2 w-full"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {certificates.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-40 h-40 rounded-lg overflow-hidden border shadow-sm bg-gray-50 group"
                  >
                    <img
                      src={url}
                      alt={`Cert ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      onClick={() =>
                        setCertificates((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Nút điều hướng ===== */}
          <div className="flex justify-between mt-6 md:mt-8">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                ◀ Trước đó
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 ml-auto transition"
              >
                Tiếp theo ▶
              </button>
            ) : (
              <button
                onClick={handleSubmitCV}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg ml-auto"
              >
                📤 Gửi hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
