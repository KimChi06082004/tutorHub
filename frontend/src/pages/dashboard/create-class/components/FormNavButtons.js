// frontend/src/pages/dashboard/create-class/components/FormNavButtons.js
export default function FormNavButtons({
  onPrev,
  onNext,
  nextText = "Tiếp theo ➜",
  prevText = "← Trước đó",
}) {
  return (
    <div className="flex justify-between items-center mt-10">
      {onPrev ? (
        <button
          onClick={onPrev}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg transition"
        >
          {prevText}
        </button>
      ) : (
        <div></div>
      )}
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
      >
        {nextText}
      </button>
    </div>
  );
}
