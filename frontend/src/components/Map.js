// frontend/src/components/Map.js
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon marker bị lỗi không hiển thị
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Map({ classes }) {
  return (
    <MapContainer
      center={[10.7769, 106.7009]} // Mặc định: TP.HCM
      zoom={12}
      style={{ height: "500px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {classes.map(
        (c) =>
          c.lat &&
          c.lng && (
            <Marker key={c.class_id} position={[c.lat, c.lng]}>
              <Popup>
                <b>{c.subject}</b> - {c.grade} <br />
                💰 {c.tuition_amount?.toLocaleString()} VND/h <br />
                📍 {c.city}
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
}
