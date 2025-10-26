import SidebarTutor from "../../../components/SidebarTutor";
import TopbarTutor from "../../../components/TopbarTutor";

export default function TutorClasses() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarTutor />
      <div className="flex-1">
        <TopbarTutor />
        <div className="mt-20 p-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            📚 Danh sách lớp đã ứng tuyển / được chọn dạy
          </h2>
          <p>Đang phát triển...</p>
        </div>
      </div>
    </div>
  );
}
