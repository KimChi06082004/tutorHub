import dynamic from "next/dynamic";
const TutorMap = dynamic(() => import("../../components/TutorMap"), {
  ssr: false,
});

export default function MapTutorPage() {
  return (
    <div>
      <TutorMap />
    </div>
  );
}
