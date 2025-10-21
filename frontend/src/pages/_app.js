// frontend/src/pages/_app.js
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "leaflet/dist/leaflet.css"; //
import "../styles/tailwind.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
    </div>
  );
}
