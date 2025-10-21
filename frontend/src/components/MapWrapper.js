// frontend/src/components/MapWrapper.js
import { useEffect, useState } from "react";
import VietnamMap from "./VietnamMap";
import { createAvatarMarker } from "./AvatarMarker";
import api from "../utils/api";

export default function MapWrapper({ role = "tutor" }) {
  const [users, setUsers] = useState([]);

  // ✅ Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gia sư → xem học viên | Học viên → xem gia sư
        const endpoint = role === "tutor" ? "tutors/students" : "tutors";
        const res = await api.get(endpoint);
        // ✅ Backend trả về { success, data }
        setUsers(res.data.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu bản đồ:", err);
      }
    };
    fetchData();
  }, [role]);

  // ✅ Khi bản đồ sẵn sàng, thêm avatar vào
  const handleMapReady = (map) => {
    if (!map || !users.length) return;

    users.forEach((user) => {
      const lat = user.lat || 10.75 + Math.random() * 3;
      const lng = user.lng || 106.65 + Math.random() * 3;
      const avatar = user.avatar || "/avatars/default-student.png";
      const name = user.full_name || "Người dùng";

      const marker = createAvatarMarker({ lat, lng, avatar, name });
      marker.addTo(map);
    });
  };

  return <VietnamMap onMapReady={handleMapReady} />;
}
