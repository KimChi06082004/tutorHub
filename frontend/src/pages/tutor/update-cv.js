import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";
import TopbarTutor from "../../components/TopbarTutor";
import rawData from "../../utils/vietnam-provinces.json";
import { useRouter } from "next/router";
import SidebarTutor from "../../components/SidebarTutor";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

// ✅ Load bản đồ (client-only)
const VietnamMap = dynamic(() => import("../../components/VietnamMap"), {
  ssr: false,
});

// ✅ Chuẩn hoá dữ liệu tỉnh thành
const normalizeData = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    return Object.values(data).map((tinh) => ({
      name: tinh.name_with_type || tinh.name,
      code: tinh.code,
      districts: tinh["quan-huyen"]
        ? Object.values(tinh["quan-huyen"]).map((qh) => ({
            name: qh.name_with_type || qh.name,
            code: qh.code,
            wards: qh["xa-phuong"]
              ? Object.values(qh["xa-phuong"]).map((xp) => ({
                  name: xp.name_with_type || xp.name,
                  code: xp.code,
                }))
              : [],
          }))
        : [],
    }));
  }
  return [];
};
const locationData = normalizeData(rawData);

// ✅ Hàm lấy toạ độ
async function getCoordinatesByName(name) {
  try {
    const cacheKey = `geo_${name}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        name
      )}`
    );
    const data = await res.json();

    if (data && data[0]) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      localStorage.setItem(cacheKey, JSON.stringify(coords));
      return coords;
    }
  } catch (err) {
    console.warn("⚠️ Không lấy được toạ độ:", name, err);
  }
  return { lat: 14.0583, lng: 108.2772 };
}

export default function UpdateCV() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    bio: "",
    education_level: "",
    major: "",
    university: "",
    experience: "",
    gender: "",
    cccd: "",
    subject: "",
    hourly_rate: "",
    degree_url: "",
  });

  const [avatar, setAvatar] = useState("");
  const [cccdFront, setCccdFront] = useState("");
  const [cccdBack, setCccdBack] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [location, setLocation] = useState({
    city: "",
    district: "",
    ward: "",
    address: "",
    lat: 10.762622,
    lng: 106.660172,
  });
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ✅ Load dữ liệu localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorCVData");
    if (saved) {
      const data = JSON.parse(saved);
      setFormData(data.formData || {});
      setAvatar(data.avatar || "");
      setCccdFront(data.cccdFront || "");
      setCccdBack(data.cccdBack || "");
      setCertificates(data.certificates || []);
      setLocation(data.location || location);
    }
  }, []);

  // ✅ Lưu lại tự động
  useEffect(() => {
    localStorage.setItem(
      "tutorCVData",
      JSON.stringify({
        formData,
        avatar,
        cccdFront,
        cccdBack,
        certificates,
        location,
      })
    );
  }, [formData, avatar, cccdFront, cccdBack, certificates, location]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (step === 1 && (!formData.full_name || !formData.cccd || !avatar)) {
      alert(" Vui lòng nhập họ tên, CCCD và tải ảnh đại diện!");
      return;
    }
    if (step === 2 && (!formData.education_level || !formData.university)) {
      alert(" Vui lòng nhập học vấn và trường học!");
      return;
    }
    if (step === 3 && (!formData.subject || !formData.hourly_rate)) {
      alert(" Vui lòng nhập môn học và học phí!");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  // ✅ Upload ảnh
  const handleImageUpload = async (e, setter, multiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (multiple && certificates.length + files.length > 5) {
      alert(" Chỉ được upload tối đa 5 ảnh chứng chỉ!");
      return;
    }

    const fd = new FormData();
    if (multiple) Array.from(files).forEach((f) => fd.append("files", f));
    else fd.append("file", files[0]);

    try {
      const res = await fetch(
        `${API_BASE}/upload/${multiple ? "multiple" : "single"}`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!data.success) throw new Error("Upload thất bại");

      if (multiple)
        setter((prev) => [
          ...prev,
          ...data.urls.map((u) => `${API_BASE.replace("/api", "")}${u}`),
        ]);
      else setter(`${API_BASE.replace("/api", "")}${data.filePath}`);
    } catch (err) {
      alert(" Lỗi upload: " + err.message);
    }
  };

  // ✅ Gửi hồ sơ
  const handleSubmitCV = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      alert("Bạn cần đăng nhập trước khi gửi hồ sơ!");
      return;
    }

    const payload = {
      ...formData,
      avatar,
      cccd_front: cccdFront,
      cccd_back: cccdBack,
      certificates,
      ...location,
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
        alert(" Hồ sơ đã gửi thành công! Vui lòng chờ admin duyệt.");
        localStorage.removeItem("tutorCVData");

        // ✅ CHUYỂN TRANG SAU KHI GỬI THÀNH CÔNG
        router.push("/dashboard/tutor");
      } else {
        alert(" " + (data.message || "Gửi thất bại!"));
      }
    } catch (err) {
      alert(" Lỗi hệ thống: " + err.message);
    }
  };

  // ===== Xử lý địa chỉ =====
  const handleCityChange = async (cityName) => {
    const city = locationData.find((c) => c.name === cityName);
    setDistricts(city ? city.districts : []);
    setWards([]);
    setLocation((prev) => ({
      ...prev,
      city: cityName,
      district: "",
      ward: "",
    }));
    const coords = await getCoordinatesByName(cityName);
    setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  };

  const handleDistrictChange = async (districtName) => {
    const district = districts.find((d) => d.name === districtName);
    setWards(district ? district.wards : []);
    setLocation((prev) => ({ ...prev, district: districtName, ward: "" }));
    const coords = await getCoordinatesByName(
      `${districtName}, ${location.city}`
    );
    setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  };

  const handleWardChange = async (wardName) => {
    setLocation((prev) => ({ ...prev, ward: wardName }));
    const coords = await getCoordinatesByName(
      `${wardName}, ${location.district}, ${location.city}`
    );
    setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  };

  return (
    <div>
      <SidebarTutor />
      <TopbarTutor />
      <div className="main-content bg-gray-50 min-h-screen p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">
            Cập nhật hồ sơ gia sư
          </h2>

          {/* ===== BƯỚC 1 ===== */}
          {step === 1 && (
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-gray-700">
                Thông tin cá nhân
              </h3>

              {/* Avatar tròn */}
              <div className="flex flex-col items-center">
                <div className="relative w-[120px] h-[120px] rounded-full border-2 border-blue-400 bg-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Chưa có ảnh</span>
                  )}
                  <label
                    htmlFor="avatarUpload"
                    className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full p-[6px] cursor-pointer shadow-sm hover:bg-blue-50"
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
                <p className="text-xs text-gray-500 mt-2">
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
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-gray-700 font-medium">
                      Giới tính:
                    </label>{" "}
                    <div className="flex gap-6 mt-2">
                      {" "}
                      {["Nam", "Nữ"].map((gender) => (
                        <label
                          key={gender}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {" "}
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={handleChange}
                            className="accent-blue-500"
                          />{" "}
                          {gender}{" "}
                        </label>
                      ))}{" "}
                    </div>{" "}
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
              <h3 className="text-xl font-bold text-gray-700">Hồ sơ học vấn</h3>
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
                Môn học & Học phí
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-gray-700">
                    Môn học chính:
                  </label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    type="text"
                    placeholder="VD: Toán, Anh, Lý"
                    className="mt-2 border rounded-lg p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    Học phí (VNĐ/giờ):
                  </label>
                  <input
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    type="number"
                    placeholder="VD: 120000"
                    className="mt-2 border rounded-lg p-2 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700">
                  Link bằng cấp (nếu có):
                </label>
                <input
                  name="degree_url"
                  value={formData.degree_url}
                  onChange={handleChange}
                  type="text"
                  placeholder="https://example.com/certificate.pdf"
                  className="mt-2 border rounded-lg p-2 w-full"
                />
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

          {/* ===== BƯỚC 5 – Địa chỉ & bản đồ ===== */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700">
                Địa chỉ nơi dạy
              </h3>

              {/* Tỉnh / Thành phố */}
              <div>
                <label className="block font-medium mb-2">
                  Tỉnh / Thành phố:
                </label>
                <select
                  value={location.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="border p-3 w-full rounded-lg mb-4"
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {locationData.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div>
                <label className="block font-medium mb-2">Quận / Huyện:</label>
                <select
                  value={location.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="border p-3 w-full rounded-lg mb-4"
                  disabled={!location.city}
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phường / Xã */}
              <div>
                <label className="block font-medium mb-2">Phường / Xã:</label>
                <select
                  value={location.ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className="border p-3 w-full rounded-lg mb-4"
                  disabled={!location.district}
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Địa chỉ cụ thể */}
              <label className="block font-medium mb-2">
                Địa chỉ cụ thể (số nhà, tên đường):
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) =>
                  setLocation((prev) => ({ ...prev, address: e.target.value }))
                }
                className="border p-3 w-full rounded-lg mb-6"
                placeholder="VD: 123 Nguyễn Văn Bảo"
              />

              {/* Bản đồ */}
              <div className="rounded-lg overflow-hidden border h-[400px] mb-6">
                <VietnamMap
                  lat={location.lat}
                  lng={location.lng}
                  onMapClick={(lat, lng) =>
                    setLocation((prev) => ({ ...prev, lat, lng }))
                  }
                />
              </div>
            </div>
          )}

          {/* ===== Nút điều hướng ===== */}
          <div className="flex justify-between mt-10">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400"
              >
                ◀ Trước đó
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 ml-auto"
              >
                Tiếp theo ▶
              </button>
            ) : (
              <button
                onClick={handleSubmitCV}
                className="bg-green-600 text-white px-6 py-2 rounded-lg ml-auto hover:bg-green-700"
              >
                Gửi hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
