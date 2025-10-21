// frontend/src/components/StudentMap.js
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
const MapBase = dynamic(() => import("./MapBase"), { ssr: false });

function createAvatarIcon(url, size = 56) {
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      overflow:hidden;display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)
    ">
      <img src="${url}" style="width:100%;height:100%;object-fit:cover"/>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function StudentMap({
  tutors = [] /* array of {id, lat, lng, avatar, name} */,
}) {
  return (
    <MapBase center={[16.0, 108.0]} zoom={6}>
      {(map) => {
        if (!map) return null;
        map.eachLayer((lyr) => {
          if (
            lyr.options &&
            lyr.options.pane === undefined &&
            lyr instanceof L.Marker
          ) {
            map.removeLayer(lyr);
          }
        });
        tutors.forEach((t) => {
          if (!t.lat || !t.lng) return;
          const icon = createAvatarIcon(t.avatar || "/default-avatar.png", 64);
          const marker = L.marker([t.lat, t.lng], { icon }).addTo(map);
          marker.bindPopup(`<b>${t.name}</b>`);
        });
        return null;
      }}
    </MapBase>
  );
}
