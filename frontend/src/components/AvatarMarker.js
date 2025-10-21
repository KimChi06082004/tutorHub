// frontend/src/components/AvatarMarker.js

export async function createAvatarMarker({ lat, lng, name, avatar }) {
  // ⚡ tránh lỗi SSR
  if (typeof window === "undefined") return null;

  // Import động leaflet chỉ khi client đã có window
  const L = await import("leaflet");

  // Tạo HTML cho avatar marker
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    ">
      <img
        src="${avatar || "/default-student.png"}"
        alt="avatar"
        style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "
      />
      <span style="
        font-size: 12px;
        font-weight: 600;
        color: #333;
        margin-top: 2px;
      ">${name || "Người dùng"}</span>
    </div>
  `;

  // Trả về 1 icon HTML tùy chỉnh
  return L.divIcon({
    html,
    className: "",
    iconSize: [50, 60],
    iconAnchor: [25, 60],
  });
}
