// import { useEffect, useState } from "react";
// import api from "../../utils/api"; //
// import { FaEye, FaMapMarkerAlt, FaTrashAlt } from "react-icons/fa";

// export default function ClassApprovals() {
//   const [classes, setClasses] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");

//   // ✅ Lấy danh sách lớp học
//   const fetchClasses = async () => {
//     try {
//       const res = await api.get("/classes");
//       setClasses(res.data?.data || []);
//     } catch (err) {
//       console.error("❌ Fetch classes error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   // ✅ Duyệt lớp
//   const handleApprove = async (id) => {
//     if (!confirm("Xác nhận duyệt lớp này?")) return;
//     try {
//       await api.put(`/classes/${id}/approve`);
//       alert("✅ Lớp đã được duyệt!");
//       setSelected(null);
//       fetchClasses();
//     } catch {
//       alert("❌ Lỗi khi duyệt lớp!");
//     }
//   };

//   // ✅ Từ chối lớp
//   const handleReject = async (id) => {
//     if (!reason.trim()) {
//       alert("⚠️ Vui lòng nhập lý do từ chối!");
//       return;
//     }
//     if (!confirm("Bạn có chắc muốn từ chối lớp này?")) return;
//     try {
//       await api.put(`/classes/${id}/reject`, { reason });
//       alert("❌ Lớp đã bị từ chối!");
//       setReason("");
//       setSelected(null);
//       fetchClasses();
//     } catch {
//       alert("Lỗi khi từ chối lớp!");
//     }
//   };

//   // ✅ Duyệt yêu cầu hủy lớp
//   const handleApproveCancel = async (id) => {
//     if (!confirm("Xác nhận duyệt yêu cầu hủy lớp này?")) return;
//     try {
//       await api.put(`/classes/${id}/approve-cancel`);
//       alert("✅ Lớp đã được duyệt hủy!");
//       setSelected(null);
//       fetchClasses();
//     } catch {
//       alert("❌ Lỗi khi duyệt hủy lớp!");
//     }
//   };

//   // ✅ Xóa lớp (Admin-only)
//   const handleDelete = async (id) => {
//     if (!confirm("⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn lớp này?")) return;
//     try {
//       await api.delete(`/classes/${id}`);
//       alert("🗑️ Lớp đã bị xóa vĩnh viễn!");
//       setSelected(null);
//       fetchClasses();
//     } catch {
//       alert("❌ Lỗi khi xóa lớp!");
//     }
//   };

//   // ✅ Map trạng thái sang tiếng Việt
//   const renderStatus = (status) => {
//     const map = {
//       PENDING_ADMIN_APPROVAL: {
//         label: "Chờ duyệt",
//         color: "bg-yellow-100 text-yellow-700 border-yellow-300",
//       },
//       APPROVED_VISIBLE: {
//         label: "Đã duyệt",
//         color: "bg-green-100 text-green-700 border-green-300",
//       },
//       REJECTED: {
//         label: "Từ chối",
//         color: "bg-red-100 text-red-700 border-red-300",
//       },
//       CANCELLED: {
//         label: "Đã hủy",
//         color: "bg-gray-200 text-gray-700 border-gray-300",
//       },
//       DONE: {
//         label: "Hoàn tất",
//         color: "bg-blue-100 text-blue-700 border-blue-300",
//       },
//     };
//     const s = map[status] || {
//       label: status,
//       color: "bg-gray-100 text-gray-600",
//     };
//     return (
//       <span
//         className={`px-3 py-1 text-sm font-medium rounded-full border ${s.color}`}
//       >
//         {s.label}
//       </span>
//     );
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h2 className="text-2xl font-bold mb-2 text-gray-800">
//         📋 Quản lý lớp học
//       </h2>
//       <p className="text-gray-600 mb-6">
//         Duyệt / Từ chối / Duyệt hủy / Xóa lớp học
//       </p>

//       <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
//         <table className="min-w-full border-collapse text-sm">
//           <thead className="bg-blue-50 text-gray-800">
//             <tr>
//               <th className="py-3 px-4 border-b text-left">Mã lớp</th>
//               <th className="py-3 px-4 border-b text-left">Môn học</th>
//               <th className="py-3 px-4 border-b text-left">Học viên</th>
//               <th className="py-3 px-4 border-b text-left">Học phí</th>
//               <th className="py-3 px-4 border-b text-left">Trạng thái</th>
//               <th className="py-3 px-4 border-b text-center">Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {classes.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-6 text-gray-500">
//                   ⏳ Chưa có lớp nào được tạo
//                 </td>
//               </tr>
//             ) : (
//               classes.map((c) => (
//                 <tr
//                   key={c.class_id}
//                   className="hover:bg-gray-50 transition border-b"
//                 >
//                   <td className="py-3 px-4 font-medium text-gray-700">
//                     #{c.class_id}
//                   </td>
//                   <td className="py-3 px-4">{c.subject}</td>
//                   <td className="py-3 px-4">{c.student_name}</td>
//                   <td className="py-3 px-4">
//                     {c.tuition_amount?.toLocaleString()} VND/h
//                   </td>
//                   <td className="py-3 px-4">{renderStatus(c.status)}</td>
//                   <td className="py-3 px-4 text-center">
//                     <button
//                       onClick={() => setSelected(c)}
//                       className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center gap-1 mx-auto"
//                     >
//                       <FaEye /> Xem
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ✅ Popup chi tiết lớp */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl p-6 w-[550px] max-h-[90vh] overflow-y-auto">
//             <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <span className="text-blue-500">📘</span> Chi tiết lớp #
//               {selected.class_id}
//             </h3>

//             <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
//               <p>
//                 <b>Môn học:</b> {selected.subject}
//               </p>
//               <p>
//                 <b>Lớp/Khối:</b> {selected.grade}
//               </p>
//               <p>
//                 <b>Học viên:</b> {selected.student_name}
//               </p>
//               <p>
//                 <b>Học phí:</b> {selected.tuition_amount?.toLocaleString()}{" "}
//                 VND/h
//               </p>
//               <p>
//                 <b>Trạng thái:</b> {renderStatus(selected.status)}
//               </p>
//               <p>
//                 <b>Chế độ hiển thị:</b>{" "}
//                 {selected.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
//               </p>

//               <hr className="my-3" />

//               <p>
//                 <b>Địa chỉ:</b>{" "}
//                 {`${selected.address || ""}, ${selected.ward || ""}, ${
//                   selected.district || ""
//                 }, ${selected.city || ""}`}
//               </p>

//               <p className="pl-4 text-gray-600 flex items-center gap-1">
//                 <FaMapMarkerAlt className="text-red-500" />
//                 {selected.lat && selected.lng ? (
//                   <>
//                     {Number(selected.lat).toFixed(4)},{" "}
//                     {Number(selected.lng).toFixed(4)}
//                   </>
//                 ) : (
//                   <span>Không có tọa độ</span>
//                 )}
//               </p>

//               <hr className="my-3" />
//             </div>

//             <textarea
//               placeholder="Nhập lý do từ chối (nếu có)"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               className="border rounded-lg w-full p-3 mt-3 text-sm"
//             />

//             <div className="mt-5 flex flex-wrap justify-end gap-2">
//               {/* ✅ Chỉ hiển thị Duyệt / Từ chối khi lớp chưa xử lý */}
//               {["PENDING_ADMIN_APPROVAL", "PENDING"].includes(
//                 selected.status
//               ) && (
//                 <>
//                   <button
//                     onClick={() => handleApprove(selected.class_id)}
//                     disabled={loading}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
//                   >
//                     ✅ Duyệt
//                   </button>
//                   <button
//                     onClick={() => handleReject(selected.class_id)}
//                     disabled={loading}
//                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//                   >
//                     ❌ Từ chối
//                   </button>
//                 </>
//               )}

//               {/* 🕓 Duyệt hủy và 🗑️ Xóa luôn hiển thị cho admin */}
//               <button
//                 onClick={() => handleApproveCancel(selected.class_id)}
//                 disabled={loading}
//                 className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
//               >
//                 🕓 Duyệt hủy
//               </button>
//               <button
//                 onClick={() => handleDelete(selected.class_id)}
//                 disabled={loading}
//                 className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-1"
//               >
//                 <FaTrashAlt /> Xóa
//               </button>

//               <button
//                 onClick={() => setSelected(null)}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
//               >
//                 Đóng
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { FaEye, FaMapMarkerAlt, FaTrashAlt } from "react-icons/fa";
import api from "../../utils/api";

export default function ClassApprovals({ classes = [], onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  // ✅ Duyệt lớp
  const handleApprove = async (id) => {
    if (!confirm("Xác nhận duyệt lớp này?")) return;
    try {
      setLoading(true);
      await api.put(`/classes/${id}/approve`);
      alert(" Lớp đã được duyệt!");
      setSelected(null);
      onRefresh?.();
    } catch {
      alert(" Lỗi khi duyệt lớp!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Từ chối lớp
  const handleReject = async (id) => {
    if (!reason.trim()) {
      alert(" Vui lòng nhập lý do từ chối!");
      return;
    }
    if (!confirm("Bạn có chắc muốn từ chối lớp này?")) return;
    try {
      setLoading(true);
      await api.put(`/classes/${id}/reject`, { reason });
      alert(" Lớp đã bị từ chối!");
      setReason("");
      setSelected(null);
      onRefresh?.();
    } catch {
      alert("Lỗi khi từ chối lớp!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Duyệt yêu cầu hủy lớp
  const handleApproveCancel = async (id) => {
    if (!confirm("Xác nhận duyệt yêu cầu hủy lớp này?")) return;
    try {
      setLoading(true);
      await api.put(`/classes/${id}/approve-cancel`);
      alert(" Lớp đã được duyệt hủy!");
      setSelected(null);
      onRefresh?.();
    } catch {
      alert(" Lỗi khi duyệt hủy lớp!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xóa lớp (Admin-only)
  const handleDelete = async (id) => {
    if (!confirm(" Bạn có chắc chắn muốn xóa vĩnh viễn lớp này?")) return;
    try {
      setLoading(true);
      await api.delete(`/classes/${id}`);
      alert(" Lớp đã bị xóa vĩnh viễn!");
      setSelected(null);
      onRefresh?.();
    } catch {
      alert(" Lỗi khi xóa lớp!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hiển thị trạng thái đẹp + tiếng Việt đồng nhất
  const renderStatus = (status) => {
    const map = {
      PENDING_ADMIN_APPROVAL: {
        label: "Chờ duyệt",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      },
      PENDING: {
        label: "Chờ duyệt",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      },
      APPROVED_VISIBLE: {
        label: "Đã duyệt",
        color: "bg-blue-100 text-blue-700 border-blue-300",
      },
      IN_PROGRESS: {
        label: "Đang dạy",
        color: "bg-green-100 text-green-700 border-green-300",
      },
      CANCELLED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-700 border-red-300",
      },
      DONE: {
        label: "Đã giao",
        color: "bg-green-100 text-green-700 border-green-300",
      },
      REJECTED: {
        label: "Từ chối",
        color: "bg-gray-200 text-gray-700 border-gray-300",
      },
      PENDING_PAYMENT: {
        label: "Chờ thanh toán",
        color: "bg-amber-100 text-amber-700 border-amber-300",
      },
      PAYMENT_CANCELLED: {
        label: "Thanh toán bị hủy",
        color: "bg-gray-200 text-gray-600 border-gray-300",
      },
      PAID: {
        label: "Đã thanh toán",
        color: "bg-green-100 text-green-700 border-green-300",
      },
      EXPIRED: {
        label: "Hết hạn",
        color: "bg-gray-100 text-gray-600 border-gray-300",
      },
    };

    const s = map[status] || {
      label: status,
      color: "bg-gray-100 text-gray-600 border-gray-300",
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full border ${s.color}`}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-0 bg-transparent">
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-800">
            <tr>
              <th className="py-3 px-4 border-b text-left">Mã lớp</th>
              <th className="py-3 px-4 border-b text-left">Môn học</th>
              <th className="py-3 px-4 border-b text-left">Học viên</th>
              <th className="py-3 px-4 border-b text-left">Học phí</th>
              <th className="py-3 px-4 border-b text-left">Trạng thái</th>
              <th className="py-3 px-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  ⏳ Không có lớp học nào trong trang này
                </td>
              </tr>
            ) : (
              classes.map((c) => (
                <tr
                  key={c.class_id}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="py-3 px-4 font-medium text-gray-700">
                    #{c.class_id}
                  </td>
                  <td className="py-3 px-4">{c.subject}</td>
                  <td className="py-3 px-4">{c.student_name}</td>
                  <td className="py-3 px-4">
                    {c.tuition_amount?.toLocaleString()} VND/h
                  </td>
                  <td className="py-3 px-4">{renderStatus(c.status)}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelected(c)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center gap-1 mx-auto"
                    >
                      <FaEye /> Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup chi tiết lớp */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[550px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-500"></span> Chi tiết lớp #
              {selected.class_id}
            </h3>

            <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
              <p>
                <b>Môn học:</b> {selected.subject}
              </p>
              <p>
                <b>Lớp/Khối:</b> {selected.grade}
              </p>
              <p>
                <b>Học viên:</b> {selected.student_name}
              </p>
              <p>
                <b>Học phí:</b> {selected.tuition_amount?.toLocaleString()}{" "}
                VND/h
              </p>
              <p>
                <b>Trạng thái:</b> {renderStatus(selected.status)}
              </p>
              <p>
                <b>Chế độ hiển thị:</b>{" "}
                {selected.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
              </p>
              <hr className="my-3" />
              <p>
                <b>Địa chỉ:</b>{" "}
                {`${selected.address || ""}, ${selected.ward || ""}, ${
                  selected.district || ""
                }, ${selected.city || ""}`}
              </p>
              <p className="pl-4 text-gray-600 flex items-center gap-1">
                <FaMapMarkerAlt className="text-red-500" />
                {selected.lat && selected.lng ? (
                  <>
                    {Number(selected.lat).toFixed(4)},{" "}
                    {Number(selected.lng).toFixed(4)}
                  </>
                ) : (
                  <span>Không có tọa độ</span>
                )}
              </p>
              <hr className="my-3" />
            </div>

            <textarea
              placeholder="Nhập lý do từ chối (nếu có)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border rounded-lg w-full p-3 mt-3 text-sm"
            />

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {/* ✅ Chỉ hiển thị Duyệt / Từ chối khi lớp chưa xử lý */}
              {["PENDING_ADMIN_APPROVAL", "PENDING"].includes(
                selected.status
              ) && (
                <>
                  <button
                    onClick={() => handleApprove(selected.class_id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(selected.class_id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Từ chối
                  </button>
                </>
              )}
              {/* 🕓 Duyệt hủy & Xóa luôn hiển thị cho admin */}
              <button
                onClick={() => handleApproveCancel(selected.class_id)}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                Duyệt hủy
              </button>
              <button
                onClick={() => handleDelete(selected.class_id)}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-1"
              >
                <FaTrashAlt /> Xóa
              </button>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
