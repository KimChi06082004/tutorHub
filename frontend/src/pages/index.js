import Image from "next/image";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Avatar luân phiên
  const teachers = [
    { id: 1, src: "/avatars/teacher1.jpg", style: "top-[17%] left-[57%]" },
    { id: 2, src: "/avatars/teacher2.jpg", style: "top-[35%] left-[45%]" },
    { id: 3, src: "/avatars/teacher3.jpg", style: "top-[55%] left-[50%]" },
    { id: 4, src: "/avatars/teacher4.jpg", style: "bottom-[18%] left-[35%]" },
    { id: 5, src: "/avatars/teacher5.jpg", style: "bottom-[10%] right-[38%]" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % teachers.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* 🔹 TOPBAR */}
      <header className="flex items-center justify-between px-8 lg:px-20 py-3 bg-[#0076B6] text-white fixed top-0 left-0 w-full z-50 shadow-md h-[90px]">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/logo-daythem.png"
            alt="DayThem Logo"
            width={220}
            height={220}
            className="object-contain"
            priority
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#0076B6] transition"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-white text-[#0076B6] px-4 py-2 rounded-lg hover:bg-[#FFCC00] hover:text-black transition font-semibold"
          >
            Đăng ký
          </button>
        </div>
      </header>

      {/* 🔹 HERO SECTION */}
      <main className="flex flex-col lg:flex-row items-center justify-between flex-1 pt-[120px] px-6 lg:px-20 gap-8">
        {/* BÊN TRÁI */}
        <div className="flex-1 max-w-3xl space-y-8 text-gray-800">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-snug">
            Nhận dạy <span className="text-[#0076B6]">Nhanh Chóng</span> <br />
            Và <span className="text-[#FF8800]">Tối Ưu!</span>
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            Hệ thống cung cấp một nền tảng dạy học trực tuyến và tại nhà. Dễ
            dàng tìm kiếm, ứng tuyển vào các lớp học phù hợp và kết nối học viên
            – gia sư uy tín trên toàn quốc.
          </p>

          <button
            onClick={() => router.push("/tutor/update-cv")}
            className="bg-[#FF8800] hover:bg-[#FF6600] text-white px-6 py-3 rounded-lg text-lg font-semibold transition shadow-md"
          >
            🎓 Bắt đầu tạo CV
          </button>

          {/* ✅ KHUNG GIÁO VIÊN + NGÀNH HỌC */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 mt-10">
            {/* Giáo viên */}
            <div className="flex-1 bg-white rounded-2xl shadow-md border border-gray-200 flex items-center gap-5 p-6 hover:shadow-lg transition">
              <Image
                src="/teacher.webp"
                alt="Teacher"
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
              <div>
                <p className="text-gray-700">
                  Giáo viên có{" "}
                  <span className="font-semibold text-[#0076B6]">
                    chứng chỉ, bằng cấp
                  </span>{" "}
                  giảng dạy chuyên nghiệp
                </p>
                <p className="text-3xl font-bold text-[#0076B6] mt-2">2,027+</p>
                <p className="text-gray-600 text-sm">
                  Người dạy đang đồng hành cùng chúng tôi
                </p>
              </div>
            </div>

            {/* Ngành học */}
            <div className="flex-1 bg-[#F3F8FF] rounded-2xl shadow-md border border-gray-200 p-6 relative overflow-hidden hover:shadow-lg transition">
              {/* Nút mũi tên */}
              <div className="absolute right-3 top-3 bg-[#FF8800] text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
                ↗
              </div>

              {/* Danh mục */}
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-semibold text-[#0076B6] flex items-center gap-2">
                    🗣 Ngoại ngữ
                  </p>
                  <p className="text-2xl font-bold text-[#0076B6]">66+</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0076B6] flex items-center gap-2">
                    💻 Lập trình
                  </p>
                  <p className="text-2xl font-bold text-[#0076B6]">1+</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm z-10 relative">
                Dạy đa ngành nghề phù hợp mọi trình độ và nhu cầu học
              </p>

              {/* hình trang trí */}
              <Image
                src="/images/decorates/line2.svg"
                alt="Decor"
                width={120}
                height={40}
                className="absolute bottom-4 right-4 opacity-30"
              />
            </div>
          </div>
        </div>

        {/* 🔹 BẢN ĐỒ VIỆT NAM */}
        <div className="flex-1 relative flex justify-center items-center mt-10 lg:mt-0">
          <Image
            src="/map-vietnam.svg"
            alt="Vietnam Map"
            width={600}
            height={700}
            className="object-contain"
          />
          <AnimatePresence>
            {teachers.map(
              (t, i) =>
                i === visibleIndex && (
                  <motion.div
                    key={t.id}
                    className={`absolute ${t.style}`}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  >
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-[#66B3FF] opacity-30 animate-ping-slow"></span>
                      <Image
                        src={t.src}
                        alt="Gia sư"
                        width={70}
                        height={70}
                        className="rounded-full border-4 border-white shadow-lg relative z-10"
                      />
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 🔹 FOOTER */}
      <footer className="bg-[#0076B6] text-white text-center py-6 text-sm mt-16">
        © {new Date().getFullYear()} <b>DayThem.com</b> – Nền tảng kết nối học
        viên và gia sư toàn quốc.
      </footer>

      {/* CSS hiệu ứng sáng */}
      <style jsx global>{`
        @keyframes ping-slow {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.8);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
