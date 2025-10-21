// src/components/SidebarMenu.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function SidebarMenu({ role }) {
  const [open, setOpen] = useState(true); // mở/đóng sidebar
  const [submenu, setSubmenu] = useState({});
  const router = useRouter();

  const toggleSubmenu = (menu) => {
    setSubmenu({ ...submenu, [menu]: !submenu[menu] });
  };

  const menus =
    role === "student"
      ? [
          { title: "🏠 Về trang chủ", link: "/dashboard/student" },
          {
            title: "📑 Quản lý tuyển chọn",
            link: "/dashboard/student?view=classes",
          },
          {
            title: "💰 Quản lý học phí",
            children: [
              {
                title: "Cần thanh toán",
                link: "/dashboard/student?view=payment-pending",
              },
              {
                title: "Đã thanh toán",
                link: "/dashboard/student?view=payment-done",
              },
              {
                title: "Hủy thanh toán",
                link: "/dashboard/student?view=payment-cancel",
              },
            ],
          },
          {
            title: "📘 Quản lý lớp học",
            children: [
              {
                title: "Lớp đang dạy",
                link: "/dashboard/student?view=active-classes",
              },
              {
                title: "Lớp kết thúc",
                link: "/dashboard/student?view=finished-classes",
              },
            ],
          },
          {
            title: "➕ Đăng tuyển lớp",
            link: "/dashboard/student?view=create-class",
          },
          {
            title: "📂 Kho học tập",
            children: [
              {
                title: "Làm bài tập",
                link: "/dashboard/student?view=homework",
              },
              {
                title: "Đọc tài liệu",
                link: "/dashboard/student?view=documents",
              },
            ],
          },
        ]
      : [
          { title: "🏠 Về trang chủ", link: "/dashboard/tutor" },
          {
            title: "📑 Quản lý tuyển lớp",
            link: "/dashboard/tutor?view=classes",
          },
          { title: "📝 Cập nhật CV hồ sơ", link: "/dashboard/tutor?view=cv" },
          {
            title: "✅ Quản lý ứng chọn",
            link: "/dashboard/tutor?view=applications",
          },
          {
            title: "💰 Quản lý lệ phí",
            children: [
              {
                title: "Cần tạm ứng",
                link: "/dashboard/tutor?view=payout-pending",
              },
              {
                title: "Đã tạm ứng",
                link: "/dashboard/tutor?view=payout-done",
              },
              {
                title: "Hủy tạm ứng",
                link: "/dashboard/tutor?view=payout-cancel",
              },
            ],
          },
          {
            title: "📘 Quản lý lớp dạy",
            children: [
              {
                title: "Lớp đang dạy",
                link: "/dashboard/tutor?view=active-classes",
              },
              {
                title: "Lớp kết thúc",
                link: "/dashboard/tutor?view=finished-classes",
              },
            ],
          },
          {
            title: "📂 Quản lý thư viện",
            children: [
              { title: "Biên soạn tệp", link: "/dashboard/tutor?view=files" },
              {
                title: "Xem bài giảng",
                link: "/dashboard/tutor?view=lectures",
              },
              { title: "Chọn đề thi", link: "/dashboard/tutor?view=exams" },
            ],
          },
        ];

  return (
    <div>
      {/* Nút toggle menu trên mobile */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {open && (
        <div className="sidebar">
          <ul>
            {menus.map((m, i) => (
              <li key={i}>
                {m.children ? (
                  <>
                    <div
                      onClick={() => toggleSubmenu(m.title)}
                      className="menu-item"
                    >
                      {m.title} {submenu[m.title] ? "▲" : "▼"}
                    </div>
                    {submenu[m.title] && (
                      <ul className="submenu">
                        {m.children.map((c, j) => (
                          <li key={j}>
                            <Link href={c.link}>{c.title}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={m.link}>{m.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nút lọc theo bản đồ */}
      <button
        className="map-btn"
        onClick={() => router.push("/dashboard/student?view=map")}
      >
        🗺 Lọc theo bản đồ Việt Nam
      </button>

      <style jsx>{`
        .hamburger {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          font-size: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          z-index: 2000;
        }
        .sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #ddd;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          padding: 20px;
          overflow-y: auto;
          z-index: 1500;
        }
        .sidebar ul {
          list-style: none;
          padding: 0;
        }
        .sidebar li {
          margin: 10px 0;
        }
        .submenu {
          margin-left: 15px;
          margin-top: 5px;
        }
        .map-btn {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: #0d6efd;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          z-index: 2000;
        }
        @media (max-width: 768px) {
          .hamburger {
            display: block;
          }
          .sidebar {
            display: ${open ? "block" : "none"};
          }
        }
      `}</style>
    </div>
  );
}
