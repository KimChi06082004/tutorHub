// frontend/src/components/MapBase.js
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapBase({ center, zoom = 13, children }) {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = L.map(mapContainer.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
  }, [center, zoom]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "100%",
        width: "100%",
        minHeight: 400,
        borderRadius: 8,
      }}
    >
      {mapRef.current && typeof children === "function"
        ? children(mapRef.current)
        : null}
    </div>
  );
}
