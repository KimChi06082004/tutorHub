import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import StepProgress from "./components/StepProgress";
import FormNavButtons from "./components/FormNavButtons";
import rawData from "../../../utils/vietnam-provinces.json";
import SidebarStudent from "../../../components/SidebarStudent";

// ✅ Chuẩn hoá JSON dạng object → mảng
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
const VietnamMap = dynamic(() => import("../../../components/VietnamMap"), {
  ssr: false,
});

// ✅ Hàm lấy toạ độ trung tâm theo địa danh (dùng OpenStreetMap)
async function getCoordinatesByName(name) {
  try {
    // Cache trong localStorage để tránh gọi lại
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
  // fallback về Việt Nam
  return { lat: 14.0583, lng: 108.2772 };
}

export default function Step3() {
  const router = useRouter();

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

  // ✅ Load dữ liệu lưu sẵn (nếu có)
  useEffect(() => {
    const saved = localStorage.getItem("classStep3");
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // ✅ Khi chọn Tỉnh / Thành phố
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

  // ✅ Khi chọn Quận / Huyện
  const handleDistrictChange = async (districtName) => {
    const district = districts.find((d) => d.name === districtName);
    setWards(district ? district.wards : []);
    setLocation((prev) => ({ ...prev, district: districtName, ward: "" }));

    const coords = await getCoordinatesByName(
      `${districtName}, ${location.city}`
    );
    setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  };

  // ✅ Khi chọn Phường / Xã
  const handleWardChange = async (wardName) => {
    setLocation((prev) => ({ ...prev, ward: wardName }));

    const coords = await getCoordinatesByName(
      `${wardName}, ${location.district}, ${location.city}`
    );
    setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
  };

  // ✅ Tự động lưu mỗi khi location thay đổi
  useEffect(() => {
    localStorage.setItem("classStep3", JSON.stringify(location));
  }, [location]);

  const nextStep = () => {
    localStorage.setItem("classStep3", JSON.stringify(location));
    router.push("/dashboard/create-class/Step4");
  };

  const prevStep = () => {
    localStorage.setItem("classStep3", JSON.stringify(location));
    router.back();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarStudent />
      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <StepProgress current={3} />
            <h2 className="text-2xl font-semibold mb-6">📍 Địa chỉ nơi dạy</h2>

            {/* Tỉnh / Thành phố */}
            <label className="block font-semibold mb-2">
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

            {/* Quận / Huyện */}
            <label className="block font-semibold mb-2">Quận / Huyện:</label>
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

            {/* Phường / Xã */}
            <label className="block font-semibold mb-2">Phường / Xã:</label>
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

            {/* Địa chỉ cụ thể */}
            <label className="block font-semibold mb-2">
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

            <FormNavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
