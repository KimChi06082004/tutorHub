// frontend/src/pages/dashboard/create-class/components/StepProgress.js
export default function StepProgress({ current = 1 }) {
  const steps = [
    { id: 1, label: "BƯỚC 01", color: "bg-blue-600" },
    { id: 2, label: "BƯỚC 02", color: "bg-orange-500" },
    { id: 3, label: "BƯỚC 03", color: "bg-emerald-500" },
    { id: 4, label: "BƯỚC 04", color: "bg-purple-600" },
  ];

  return (
    <div className="flex justify-center md:justify-start items-center mb-8 gap-4 flex-wrap">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition 
            ${
              step.id === current
                ? `${step.color}`
                : "bg-gray-300 text-gray-700 shadow-none"
            }`}
        >
          {step.label}
        </div>
      ))}
    </div>
  );
}
