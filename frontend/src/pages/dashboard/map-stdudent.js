import dynamic from "next/dynamic";
const StudentMap = dynamic(() => import("../../components/StudentMap"), {
  ssr: false,
});

export default function MapStudentPage() {
  return (
    <div>
      <StudentMap />
    </div>
  );
}
