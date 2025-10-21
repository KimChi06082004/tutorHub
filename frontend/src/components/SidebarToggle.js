// frontend/src/components/SidebarToggle.js
import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";

// Import map thông qua MapWrapper (dynamic import client-only)
const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false });

export default function SidebarToggle({ tutors }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {/* Nút toggle hiển thị trên mobile */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
        <Sidebar />
      </div>

      {/* Floating button "Lọc theo bản đồ Việt Nam" */}
      <button className="floating-map-btn" onClick={() => setShowMap(!showMap)}>
        🌍 Lọc theo bản đồ Việt Nam
      </button>

      {/* Map hiển thị khi bấm nút */}
      {showMap && (
        <div className="map-overlay">
          <MapWrapper tutors={tutors || []} />
          <button className="close-map-btn" onClick={() => setShowMap(false)}>
            ✖ Đóng bản đồ
          </button>
        </div>
      )}
    </>
  );
}
