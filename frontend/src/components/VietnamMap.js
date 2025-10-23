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

      // ✅ Ép kiểu lat/lng an toàn
      const safeLat = parseFloat(lat);
      const safeLng = parseFloat(lng);

      // ✅ Nếu lat/lng không hợp lệ thì bỏ qua
      if (
        !safeLat ||
        !safeLng ||
        Number.isNaN(safeLat) ||
        Number.isNaN(safeLng)
      )
        return;

      // ✅ Di chuyển bản đồ đến vị trí
      map.flyTo([safeLat, safeLng], zoom, { animate: true, duration: 1 });

      // ✅ Hiển thị marker chính
      if (singleMarker) {
        if (markerRef.current) map.removeLayer(markerRef.current);
        markerRef.current = L.marker([safeLat, safeLng]).addTo(map);
      }

      // ✅ Hiển thị danh sách marker phụ
      points.forEach((p) => {
        const pLat = parseFloat(p.lat);
        const pLng = parseFloat(p.lng);
        if (Number.isNaN(pLat) || Number.isNaN(pLng)) return;

        // tránh trùng với marker chính
        if (singleMarker && pLat === safeLat && pLng === safeLng) return;

        const marker = L.marker([pLat, pLng]).addTo(map);
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
