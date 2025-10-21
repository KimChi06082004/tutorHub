// frontend/src/components/TutorMap.js
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function TutorMap({ tutors = [] }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null); // để tránh re-init nhiều lần

  useEffect(() => {
    // ⚡ tránh chạy ở SSR
    if (typeof window === "undefined" || !mapRef.current) return;

    (async () => {
      // import động Leaflet
      const L = await import("leaflet");

      // Nếu bản đồ chưa được khởi tạo -> khởi tạo
      if (!leafletRef.current) {
        const map = L.map(mapRef.current).setView([10.762622, 106.660172], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        leafletRef.current = map; // lưu tham chiếu map
      }

      const map = leafletRef.current;

      // ✅ Xóa marker cũ trước khi thêm mới
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // ✅ Thêm marker cho mỗi tutor
      tutors.forEach((tutor) => {
        const lat = tutor.lat || 10.762622;
        const lng = tutor.lng || 106.660172;
        const name = tutor.name || "Gia sư";

        // Nếu có avatar → dùng icon riêng
        const icon = L.icon({
          iconUrl: tutor.avatar || "/default-student.png", // ảnh mặc định nếu không có
          iconSize: [40, 40],
          className: "rounded-full border-2 border-white shadow-lg",
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${name}</b><br/>${tutor.city || "Việt Nam"}`);
      });
    })();
  }, [tutors]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
}
