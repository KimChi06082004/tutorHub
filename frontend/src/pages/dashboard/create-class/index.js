import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import StepProgress from "./components/StepProgress";
import FormNavButtons from "./components/FormNavButtons";

export default function Step1() {
  const router = useRouter();
  const [form, setForm] = useState({
    field: "", // ngành học
    subject: "", // môn
    grade: "", // lớp
  });

  // ✅ Tải lại dữ liệu đã lưu
  useEffect(() => {
    const saved = localStorage.getItem("classStep1");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {
        console.warn("⚠️ Parse Step1 error");
      }
    }
  }, []);

  // ✅ Cập nhật form
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Lưu trước khi chuyển bước
  const nextStep = () => {
    if (!form.field || !form.subject || !form.grade) {
      alert("Vui lòng chọn đầy đủ ngành, môn và lớp học.");
      return;
    }
    localStorage.setItem("classStep1", JSON.stringify(form));
    router.push("/dashboard/create-class/Step2");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <StepProgress current={1} />
            <h2 className="text-2xl font-semibold mb-6">
              Tạo lớp đăng tuyển - Tại nhà
            </h2>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Ngành học:</label>
              <select
                className="border p-3 rounded-lg w-full"
                value={form.field}
                onChange={(e) => handleChange("field", e.target.value)}
              >
                <option value="">-- Chọn ngành học --</option>
                <option value="Phổ thông">Phổ thông</option>
                <option value="Ngoại ngữ">Ngoại ngữ</option>
                <option value="Âm nhạc">Âm nhạc</option>
                <option value="Lập trình">Lập trình</option>
                <option value="Thể thao">Thể thao</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Môn học:</label>
              <input
                type="text"
                className="border p-3 rounded-lg w-full"
                placeholder="VD: Toán, Tiếng Anh, Guitar..."
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="font-semibold block mb-1">Lớp học:</label>
              <select
                className="border p-3 rounded-lg w-full"
                value={form.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
              >
                <option value="">-- Chọn lớp học --</option>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
                <option value="Lớp 6">Lớp 6</option>
                <option value="Lớp 7">Lớp 7</option>
                <option value="Lớp 8">Lớp 8</option>
                <option value="Lớp 9">Lớp 9</option>
                <option value="Lớp 10">Lớp 10</option>
                <option value="Lớp 11">Lớp 11</option>
                <option value="Lớp 12">Lớp 12</option>
              </select>
            </div>

            <FormNavButtons onNext={nextStep} nextText="Tiếp theo" />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
