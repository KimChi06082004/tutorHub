import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../../components/Sidebar";
import TopbarStudent from "../../../components/TopbarStudent";
import Footer from "../../../components/Footer";
import StepProgress from "./components/StepProgress";
import FormNavButtons from "./components/FormNavButtons";

export default function Step2() {
  const router = useRouter();

  const [requirements, setRequirements] = useState({
    education: "",
    experience: "",
    gender: [],
    ageRange: [18, 60],
    bio: "",
    fee: "",
  });

  // ✅ Load lại dữ liệu khi quay lại từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("classStep2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRequirements((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn("⚠️ Parse Step2 data error:", err);
      }
    }
  }, []);

  // ✅ Khi thay đổi input thì cập nhật state
  const handleChange = (field, value) => {
    setRequirements({ ...requirements, [field]: value });
  };

  // ✅ Lưu và đi tiếp
  const nextStep = () => {
    localStorage.setItem("classStep2", JSON.stringify(requirements));
    router.push("/dashboard/create-class/Step3");
  };

  // ✅ Lưu tạm dữ liệu trước khi quay lại trang trước
  const prevStep = () => {
    localStorage.setItem("classStep2", JSON.stringify(requirements));
    router.back();
  };

  // ✅ Toggle giới tính
  const toggleGender = (g) => {
    setRequirements((prev) => {
      const exists = prev.gender.includes(g);
      return {
        ...prev,
        gender: exists
          ? prev.gender.filter((x) => x !== g)
          : [...prev.gender, g],
      };
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopbarStudent />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <StepProgress current={2} />
            <h2 className="text-2xl font-semibold mb-6">Yêu cầu người dạy</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cột 1 */}
              <div>
                <label className="block font-semibold mb-1">Trình độ:</label>
                <select
                  className="border p-3 w-full rounded-lg"
                  value={requirements.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                >
                  <option value="">-- Chọn trình độ --</option>
                  <option value="TH Phổ thông">TH Phổ thông</option>
                  <option value="Cao đẳng">Cao đẳng</option>
                  <option value="Đại học">Đại học</option>
                  <option value="Thạc sĩ">Thạc sĩ</option>
                </select>

                <label className="block font-semibold mb-1 mt-4">
                  Kinh nghiệm:
                </label>
                <select
                  className="border p-3 w-full rounded-lg"
                  value={requirements.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                >
                  <option value="">-- Chọn kinh nghiệm --</option>
                  <option value="Sinh viên dạy kèm">Sinh viên dạy kèm</option>
                  <option value="Gia sư tự do">Gia sư tự do</option>
                  <option value="Giáo viên chuyên nghiệp">
                    Giáo viên chuyên nghiệp
                  </option>
                </select>

                <label className="block font-semibold mb-1 mt-4">
                  Giới tính:
                </label>
                <div className="flex gap-4">
                  {["Nam", "Nữ"].map((g) => (
                    <label key={g} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={requirements.gender.includes(g)}
                        onChange={() => toggleGender(g)}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Cột 2 */}
              <div>
                <label className="block font-semibold mb-1">
                  Phí thuê gia sư (đ/giờ):
                </label>
                <input
                  type="number"
                  className="border p-3 w-full rounded-lg"
                  placeholder="VD: 100000"
                  value={requirements.fee}
                  onChange={(e) => handleChange("fee", e.target.value)}
                />

                <label className="block font-semibold mb-1 mt-4">
                  Mô tả thêm:
                </label>
                <textarea
                  className="border p-3 w-full rounded-lg h-32"
                  placeholder="VD: Gia sư có thể dạy tại nhà, thân thiện, dễ hiểu..."
                  value={requirements.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                ></textarea>
              </div>
            </div>

            <FormNavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
