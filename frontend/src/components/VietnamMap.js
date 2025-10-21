// frontend/src/components/VietnamMap.js
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function VietnamMap({
  lat = 10.762622,
  lng = 106.660172,
  zoom = 13,
  onMapClick,
  points = [],
  singleMarker = true,
}) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    (async () => {
      const L = await import("leaflet");

      // ⚡ Fix icon lỗi không hiển thị
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // 🔹 Chỉ khởi tạo map 1 lần
      if (!leafletRef.current) {
        const map = L.map(mapRef.current).setView([lat, lng], zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Cho phép chọn vị trí thủ công
        if (onMapClick) {
          map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);

            if (singleMarker) {
              if (markerRef.current) map.removeLayer(markerRef.current);
              markerRef.current = L.marker([lat, lng]).addTo(map);
            }
          });
        }

        leafletRef.current = map;
      }

      const map = leafletRef.current;

      // ✅ Khi lat/lng thay đổi → fly tới vị trí mới
      map.flyTo([lat, lng], zoom, { animate: true, duration: 1 });

      // ✅ Hiển thị marker tại vị trí hiện tại
      if (singleMarker) {
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      // ✅ Nếu có danh sách points → hiển thị thêm marker phụ
      points.forEach((p) => {
        if (!p.lat || !p.lng) return;
        const marker = L.marker([p.lat, p.lng]).addTo(map);
        marker.bindPopup(`<b>${p.name || "Vị trí"}</b>`);
      });
    })();
  }, [lat, lng, points]);

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
