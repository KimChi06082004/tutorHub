// frontend/src/components/VietnamMap.js
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function VietnamMap({
  lat = 10.762622, // Tọa độ mặc định HCM
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

      // ⚡ Fix lỗi icon mặc định không hiển thị
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // ✅ Chỉ khởi tạo bản đồ 1 lần
      if (!leafletRef.current) {
        const map = L.map(mapRef.current).setView([lat, lng], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        // ✅ Sự kiện click trên bản đồ
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

      // ✅ Xử lý tọa độ an toàn tuyệt đối
      let safeLat = parseFloat(lat);
      let safeLng = parseFloat(lng);
      const safeZoom = zoom || 12;

      // Nếu không hợp lệ → fallback HCM
      if (isNaN(safeLat) || isNaN(safeLng)) {
        console.warn("⚠️ Invalid Lat/Lng:", lat, lng, "→ fallback HCM");
        safeLat = 10.7769;
        safeLng = 106.7009;
      }

      // ✅ Đảm bảo map có sẵn rồi mới flyTo
      if (map && typeof safeLat === "number" && typeof safeLng === "number") {
        try {
          map.invalidateSize(); // tránh lỗi map chưa render xong
          map.flyTo([safeLat, safeLng], safeZoom, {
            animate: true,
            duration: 1.2,
          });
        } catch (e) {
          console.error("❌ flyTo error:", e);
        }
      }

      // ✅ Marker chính
      if (singleMarker) {
        if (markerRef.current) map.removeLayer(markerRef.current);
        markerRef.current = L.marker([safeLat, safeLng]).addTo(map);
      }

      // ✅ Các marker phụ (nếu có)
      if (Array.isArray(points) && points.length > 0) {
        points.forEach((p) => {
          const pLat = parseFloat(p.lat);
          const pLng = parseFloat(p.lng);

          if (Number.isNaN(pLat) || Number.isNaN(pLng)) return;
          if (singleMarker && pLat === safeLat && pLng === safeLng) return;

          const marker = L.marker([pLat, pLng]).addTo(map);
          marker.bindPopup(`<b>${p.name || "Vị trí"}</b>`);
        });
      }
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
        boxShadow: "0 0 8px rgba(0,0,0,0.1)",
      }}
    />
  );
}
