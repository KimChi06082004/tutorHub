// frontend/src/components/MapWrapper.js
import VietnamMap from "./VietnamMap";

export default function MapWrapper({
  role = "student",
  tutors = [],
  students = [],
}) {
  // ✅ Xác định tập dữ liệu hiển thị
  const users = role === "tutor" ? students : tutors;

  // ✅ Tạo danh sách điểm hiển thị trên bản đồ
  const points = (users || [])
    .filter(
      (u) =>
        u.lat &&
        u.lng &&
        !Number.isNaN(parseFloat(u.lat)) &&
        !Number.isNaN(parseFloat(u.lng))
    )
    .map((u) => ({
      lat: parseFloat(u.lat),
      lng: parseFloat(u.lng),
      name: u.full_name || "Người dùng",
    }));

  return (
    <VietnamMap
      lat={points[0]?.lat || 14.0583} // fallback: trung tâm VN
      lng={points[0]?.lng || 108.2772}
      zoom={6}
      points={points}
      singleMarker={false}
    />
  );
}
