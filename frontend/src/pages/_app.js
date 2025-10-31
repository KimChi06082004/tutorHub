"use client"; // 🧩 Bắt buộc — đánh dấu file này là Client Component

import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import "../styles/tailwind.css";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Chatbot from "../components/Chatbot";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
      <Footer />
      {/* ✅ Toaster chỉ chạy ở client, tránh hydration error */}
      <Toaster position="top-right" reverseOrder={false} />
      <Chatbot />
    </div>
  );
}
