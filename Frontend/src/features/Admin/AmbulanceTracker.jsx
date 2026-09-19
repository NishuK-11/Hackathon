// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { toggleTheme } from "../../redux/slices/themeSlice";
// import {
//   getRequestedEmergencies,
//   updateEmergencyStatus,
// } from "../../api/backend";

// const AmbulanceTracker = () => {
//   const dispatch = useDispatch();
//   const mode = useSelector((state) => state.theme.mode);

//   const [emergencies, setEmergencies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState(null);
//   const [error, setError] = useState("");

//   const fetchEmergencies = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await getRequestedEmergencies();

//       setEmergencies(response.data?.emergencies || []);
//     } catch (err) {
//       console.error("Failed to fetch emergency requests:", err);

//       setError(
//         err.response?.data?.message ||
//           "Failed to fetch emergency requests"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmergencies();
//   }, []);

//   const handleStatusUpdate = async (emergencyId, status) => {
//     try {
//       setUpdatingId(emergencyId);
//       setError("");

//       await updateEmergencyStatus(emergencyId, status);

//       setEmergencies((prev) =>
//         prev.filter((item) => item._id !== emergencyId)
//       );
//     } catch (err) {
//       console.error("Failed to update emergency status:", err);

//       setError(
//         err.response?.data?.message ||
//           "Failed to update emergency status"
//       );
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const formatTime = (date) => {
//     if (!date) return "Unknown";

//     return new Date(date).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-gray-400">
//           <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 dark:border-gray-700 border-t-teal-700 dark:border-t-teal-400 animate-spin" />
//           <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 m-0">
//             Loading emergency requests
//           </h3>
//           <p className="text-sm m-0">Fetching active ambulance requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 px-4 sm:px-8 lg:px-12 py-8 pb-16">
//       {/* ================= HEADER ================= */}
//       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 mb-6 border-b border-slate-200 dark:border-gray-800">
//         <div>
//           <div className="text-[12.5px] font-semibold tracking-wide text-teal-700 dark:text-teal-400 mb-1.5">
//             EMERGENCY RESPONSE CENTER
//           </div>

//           <h1 className="text-2xl sm:text-[30px] font-bold leading-tight m-0 mb-1.5 tracking-tight">
//             Ambulance{" "}
//             <span className="text-teal-700 dark:text-teal-400">Tracker</span>
//           </h1>

//           <p className="text-slate-500 dark:text-gray-400 text-sm max-w-[46ch] m-0">
//             Monitor and manage emergency ambulance requests in real time.
//           </p>
//         </div>

//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <button
//             className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-2 whitespace-nowrap flex-1 sm:flex-none justify-center"
//             onClick={fetchEmergencies}
//           >
//             <span className="text-base">↻</span>
//             Refresh
//           </button>

//           <button
//             onClick={() => dispatch(toggleTheme())}
//             className="px-3 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium whitespace-nowrap"
//           >
//             {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
//           </button>
//         </div>
//       </div>

//       {/* ================= ERROR ================= */}
//       {error && (
//         <div className="flex gap-3 items-start bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 px-4 py-3.5 rounded-lg mb-6">
//           <span className="w-[22px] h-[22px] shrink-0 grid place-items-center bg-red-600 text-white rounded-full font-bold text-[13px]">
//             !
//           </span>
//           <div>
//             <strong className="block text-sm">Something went wrong</strong>
//             <p className="mt-0.5 text-[13.5px] m-0">{error}</p>
//           </div>
//         </div>
//       )}

//       {/* ================= STATS ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="flex items-center gap-3.5 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl px-5 py-4">
//           <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0 bg-red-50 dark:bg-red-900/25">
//             🚨
//           </div>
//           <div>
//             <span className="block text-[12.5px] text-slate-500 dark:text-gray-400 mb-1">
//               Pending Requests
//             </span>
//             <strong className="text-xl font-bold text-red-600 dark:text-red-400">
//               {emergencies.length}
//             </strong>
//           </div>
//         </div>

//         <div className="flex items-center gap-3.5 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl px-5 py-4">
//           <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0 bg-emerald-50 dark:bg-emerald-900/25">
//             🚑
//           </div>
//           <div>
//             <span className="block text-[12.5px] text-slate-500 dark:text-gray-400 mb-1">
//               Ambulance Status
//             </span>
//             <strong className="text-xl font-bold">
//               {emergencies.length > 0 ? "Attention Required" : "All Clear"}
//             </strong>
//           </div>
//         </div>

//         <div className="flex items-center gap-3.5 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl px-5 py-4">
//           <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0 bg-teal-50 dark:bg-teal-900/25">
//             ⏱
//           </div>
//           <div>
//             <span className="block text-[12.5px] text-slate-500 dark:text-gray-400 mb-1">
//               Response Queue
//             </span>
//             <strong className="text-xl font-bold">
//               {emergencies.length > 0
//                 ? `${emergencies.length} Active`
//                 : "No Active"}
//             </strong>
//           </div>
//         </div>
//       </div>

//       {/* ================= EMPTY ================= */}
//       {emergencies.length === 0 ? (
//         <div className="text-center bg-white dark:bg-[#0B1220] border border-dashed border-slate-300 dark:border-gray-700 rounded-2xl px-6 py-16">
//           <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/25 grid place-items-center text-2xl">
//             🚑
//           </div>
//           <h2 className="text-lg font-semibold m-0 mb-1.5">
//             No active emergency requests
//           </h2>
//           <p className="text-slate-500 dark:text-gray-400 text-sm m-0 mb-5">
//             There are currently no patients waiting for emergency ambulance
//             assistance.
//           </p>
//           <button
//             className="border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent hover:border-teal-700 hover:text-teal-700 dark:hover:border-teal-400 dark:hover:text-teal-400 px-4.5 py-2 rounded-lg text-[13.5px] font-semibold"
//             onClick={fetchEmergencies}
//           >
//             ↻ Check Again
//           </button>
//         </div>
//       ) : (
//         <div>
//           {/* ================= SECTION HEADING ================= */}
//           <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
//             <div>
//               <h2 className="text-lg font-semibold m-0 mb-1">
//                 Active Emergency Requests
//               </h2>
//               <p className="text-slate-500 dark:text-gray-400 text-[13.5px] m-0">
//                 Immediate attention may be required for these patients.
//               </p>
//             </div>

//             <div className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/25 px-3 py-1.5 rounded-full">
//               <span className="w-[7px] h-[7px] rounded-full bg-red-600 dark:bg-red-400 motion-safe:animate-pulse" />
//               LIVE
//             </div>
//           </div>

//           {/* ================= EMERGENCY CARDS ================= */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5">
//             {emergencies.map((emergency) => {
//               const patient = emergency.patient;
//               const hospital = emergency.hospital;

//               const isUpdating = updatingId === emergency._id;

//               return (
//                 <div
//                   className="flex flex-col gap-4 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 border-l-4 border-l-red-600 dark:border-l-red-500 rounded-2xl p-5 shadow-sm dark:shadow-none"
//                   key={emergency._id}
//                 >
//                   {/* CARD HEADER */}
//                   <div className="flex items-start justify-between gap-2.5">
//                     <div className="flex items-center gap-3">
//                       <div className="w-[42px] h-[42px] rounded-full bg-teal-50 dark:bg-teal-900/25 text-teal-700 dark:text-teal-400 font-bold grid place-items-center shrink-0">
//                         {patient?.name?.charAt(0)?.toUpperCase() || "P"}
//                       </div>
//                       <div>
//                         <h3 className="text-[15.5px] font-semibold m-0">
//                           {patient?.name || "Unknown Patient"}
//                         </h3>
//                         <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-gray-400 mt-0.5">
//                           <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
//                           <span>Emergency Request</span>
//                         </div>
//                       </div>
//                     </div>

//                     <span className="text-[11.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/25 px-2.5 py-1 rounded-full whitespace-nowrap">
//                       🚨 URGENT
//                     </span>
//                   </div>

//                   {/* TIME */}
//                   <div className="flex justify-between text-[13px] text-slate-500 dark:text-gray-400 pb-3.5 border-b border-slate-200 dark:border-gray-800">
//                     <span>Received</span>
//                     <strong className="text-slate-900 dark:text-gray-100 font-semibold">
//                       {formatTime(emergency.createdAt)}
//                     </strong>
//                   </div>

//                   {/* REASON */}
//                   <div className="flex gap-3 items-start bg-red-50 dark:bg-red-900/20 rounded-xl px-3.5 py-3">
//                     <div className="text-[15px]">⚠</div>
//                     <div>
//                       <span className="block text-xs text-red-800 dark:text-red-300 mb-0.5">
//                         Emergency Reason
//                       </span>
//                       <strong className="text-sm text-red-900 dark:text-red-200">
//                         {emergency.reason || "Emergency"}
//                       </strong>
//                     </div>
//                   </div>

//                   {/* PATIENT INFO */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div className="flex gap-2.5 items-start">
//                       <span className="w-[30px] h-[30px] rounded-lg bg-slate-50 dark:bg-gray-800/60 grid place-items-center text-[13px] shrink-0">
//                         ✉
//                       </span>
//                       <div>
//                         <label className="block text-[11.5px] text-slate-500 dark:text-gray-400">
//                           Email
//                         </label>
//                         <p className="mt-0.5 text-[13.5px] font-medium break-words m-0">
//                           {patient?.email || "Not available"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex gap-2.5 items-start">
//                       <span className="w-[30px] h-[30px] rounded-lg bg-slate-50 dark:bg-gray-800/60 grid place-items-center text-[13px] shrink-0">
//                         ☎
//                       </span>
//                       <div>
//                         <label className="block text-[11.5px] text-slate-500 dark:text-gray-400">
//                           Phone
//                         </label>
//                         <p className="mt-0.5 text-[13.5px] font-medium break-words m-0">
//                           {patient?.phone_number || "Not available"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex gap-2.5 items-start">
//                       <span className="w-[30px] h-[30px] rounded-lg bg-slate-50 dark:bg-gray-800/60 grid place-items-center text-[13px] shrink-0">
//                         🏥
//                       </span>
//                       <div>
//                         <label className="block text-[11.5px] text-slate-500 dark:text-gray-400">
//                           Hospital
//                         </label>
//                         <p className="mt-0.5 text-[13.5px] font-medium break-words m-0">
//                           {hospital?.name || "Not available"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex gap-2.5 items-start">
//                       <span className="w-[30px] h-[30px] rounded-lg bg-slate-50 dark:bg-gray-800/60 grid place-items-center text-[13px] shrink-0">
//                         📍
//                       </span>
//                       <div>
//                         <label className="block text-[11.5px] text-slate-500 dark:text-gray-400">
//                           Location
//                         </label>
//                         <p className="mt-0.5 text-[13.5px] font-medium break-words m-0">
//                           {hospital?.city
//                             ? `${hospital.city}, ${hospital.state || ""}`
//                             : "Not available"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* MESSAGE */}
//                   <div className="bg-slate-50 dark:bg-gray-800/40 rounded-xl px-3.5 py-3">
//                     <span className="text-[11.5px] text-slate-500 dark:text-gray-400">
//                       Patient Message
//                     </span>
//                     <p className="mt-1 text-[13.5px] leading-relaxed m-0">
//                       {emergency.message ||
//                         "Patient needs immediate medical assistance."}
//                     </p>
//                   </div>

//                   {/* AMBULANCE */}
//                   <div className="border border-slate-200 dark:border-gray-800 rounded-xl p-3.5">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-2 text-[13.5px]">
//                         <span className="text-sm">🚑</span>
//                         <strong>Ambulance Assignment</strong>
//                       </div>

//                       <span
//                         className={
//                           emergency.ambulance?.vehicleNumber
//                             ? "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-400"
//                             : "text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400"
//                         }
//                       >
//                         {emergency.ambulance?.vehicleNumber
//                           ? "ASSIGNED"
//                           : "NOT ASSIGNED"}
//                       </span>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//                       <div>
//                         <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-0.5">
//                           Vehicle
//                         </label>
//                         <strong className="text-[13.5px]">
//                           {emergency.ambulance?.vehicleNumber || "—"}
//                         </strong>
//                       </div>

//                       <div>
//                         <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-0.5">
//                           Driver
//                         </label>
//                         <strong className="text-[13.5px]">
//                           {emergency.ambulance?.driverName || "Not assigned"}
//                         </strong>
//                       </div>

//                       <div>
//                         <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-0.5">
//                           Driver Phone
//                         </label>
//                         <strong className="text-[13.5px]">
//                           {emergency.ambulance?.driverPhone || "—"}
//                         </strong>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ACTIONS */}
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
//                     <button
//                       className="bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/25 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg py-2.5 px-2 text-[13px] font-semibold transition-colors disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-gray-100 focus-visible:outline-offset-2"
//                       disabled={isUpdating}
//                       onClick={() =>
//                         handleStatusUpdate(emergency._id, "ACKNOWLEDGED")
//                       }
//                     >
//                       {isUpdating ? "Updating..." : "✓ Acknowledge"}
//                     </button>

//                     <button
//                       className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg py-2.5 px-2 text-[13px] font-semibold transition-colors disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-gray-100 focus-visible:outline-offset-2"
//                       disabled={isUpdating}
//                       onClick={() =>
//                         handleStatusUpdate(emergency._id, "ASSIGNED")
//                       }
//                     >
//                       🚑 Assign Ambulance
//                     </button>

//                     <button
//                       className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/25 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg py-2.5 px-2 text-[13px] font-semibold transition-colors disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-gray-100 focus-visible:outline-offset-2"
//                       disabled={isUpdating}
//                       onClick={() =>
//                         handleStatusUpdate(emergency._id, "COMPLETED")
//                       }
//                     >
//                       ✓ Complete
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AmbulanceTracker;




import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import {
  getRequestedEmergencies,
  updateEmergencyStatus,
} from "../../api/backend";

const STATUS_STEPS = [
  "REQUESTED",
  "ACKNOWLEDGED",
  "AMBULANCE_ASSIGNED",
  "ON_THE_WAY",
  "ARRIVED",
  "PATIENT_PICKED",
  "COMPLETED",
];

const STATUS_LABELS = {
  REQUESTED: "Request Received",
  ACKNOWLEDGED: "Acknowledged",
  AMBULANCE_ASSIGNED: "Ambulance Assigned",
  ON_THE_WAY: "On The Way",
  ARRIVED: "Arrived",
  PATIENT_PICKED: "Patient Picked",
  COMPLETED: "Completed",
};

const AmbulanceTracker = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Ambulance modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const [ambulanceData, setAmbulanceData] = useState({
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
  });

  // ==========================================
  // FETCH
  // ==========================================

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRequestedEmergencies();

      setEmergencies(response.data?.emergencies || []);
    } catch (err) {
      console.error("Failed to fetch emergency requests:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch emergency requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusUpdate = async (
    emergencyId,
    status,
    ambulance = null
  ) => {
    try {
      setUpdatingId(emergencyId);
      setError("");

      const response = await updateEmergencyStatus(
        emergencyId,
        status,
        ambulance
      );

      const updatedEmergency = response.data?.emergency;

      /*
       * IMPORTANT:
       *
       * Pehle hum request ko immediately remove kar rahe the.
       *
       * Ab card ko update karenge.
       *
       * Sirf COMPLETED hone par remove hoga.
       */

      if (status === "COMPLETED") {
        setEmergencies((prev) =>
          prev.filter(
            (item) => item._id !== emergencyId
          )
        );
      } else if (updatedEmergency) {
        setEmergencies((prev) =>
          prev.map((item) =>
            item._id === emergencyId
              ? updatedEmergency
              : item
          )
        );
      } else {
        setEmergencies((prev) =>
          prev.map((item) =>
            item._id === emergencyId
              ? { ...item, status }
              : item
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to update emergency status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update emergency status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // ASSIGN MODAL
  // ==========================================

  const openAssignModal = (emergency) => {
    setSelectedEmergency(emergency);

    setAmbulanceData({
      vehicleNumber:
        emergency.ambulance?.vehicleNumber || "",
      driverName:
        emergency.ambulance?.driverName || "",
      driverPhone:
        emergency.ambulance?.driverPhone || "",
    });

    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    if (updatingId) return;

    setShowAssignModal(false);
    setSelectedEmergency(null);

    setAmbulanceData({
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
    });
  };

  const handleAssignAmbulance = async (e) => {
    e.preventDefault();

    if (!ambulanceData.vehicleNumber.trim()) {
      setError("Vehicle number is required");
      return;
    }

    if (!ambulanceData.driverName.trim()) {
      setError("Driver name is required");
      return;
    }

    if (!ambulanceData.driverPhone.trim()) {
      setError("Driver phone is required");
      return;
    }

    await handleStatusUpdate(
      selectedEmergency._id,
      "AMBULANCE_ASSIGNED",
      {
        vehicleNumber:
          ambulanceData.vehicleNumber.trim(),
        driverName:
          ambulanceData.driverName.trim(),
        driverPhone:
          ambulanceData.driverPhone.trim(),
      }
    );

    setShowAssignModal(false);
    setSelectedEmergency(null);
  };

  // ==========================================
  // TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // NEXT ACTION
  // ==========================================

  const getNextAction = (emergency) => {
    switch (emergency.status) {
      case "REQUESTED":
        return {
          label: "✓ Acknowledge Request",
          status: "ACKNOWLEDGED",
          className:
            "bg-teal-600 hover:bg-teal-700 text-white",
        };

      case "ACKNOWLEDGED":
        return {
          label: "🚑 Assign Ambulance",
          status: "AMBULANCE_ASSIGNED",
          className:
            "bg-red-600 hover:bg-red-700 text-white",
        };

      case "AMBULANCE_ASSIGNED":
        return {
          label: "🚑 Start Journey",
          status: "ON_THE_WAY",
          className:
            "bg-blue-600 hover:bg-blue-700 text-white",
        };

      case "ON_THE_WAY":
        return {
          label: "📍 Mark Arrived",
          status: "ARRIVED",
          className:
            "bg-indigo-600 hover:bg-indigo-700 text-white",
        };

      case "ARRIVED":
        return {
          label: "👤 Patient Picked",
          status: "PATIENT_PICKED",
          className:
            "bg-purple-600 hover:bg-purple-700 text-white",
        };

      case "PATIENT_PICKED":
        return {
          label: "✓ Complete Emergency",
          status: "COMPLETED",
          className:
            "bg-emerald-600 hover:bg-emerald-700 text-white",
        };

      default:
        return null;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-gray-400">
          <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 dark:border-gray-700 border-t-teal-700 dark:border-t-teal-400 animate-spin" />

          <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 m-0">
            Loading emergency requests
          </h3>

          <p className="text-sm m-0">
            Fetching active ambulance requests...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 px-4 sm:px-8 lg:px-12 py-8 pb-16">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 mb-6 border-b border-slate-200 dark:border-gray-800">

        <div>
          <div className="text-[12px] font-semibold tracking-wide text-red-600 dark:text-red-400 mb-1.5">
            EMERGENCY RESPONSE CENTER
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold leading-tight m-0">
            Ambulance{" "}
            <span className="text-teal-700 dark:text-teal-400">
              Tracker
            </span>
          </h1>

          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1.5">
            Monitor emergency requests and track ambulance response.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchEmergencies}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="px-3 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {mode === "dark"
              ? "☀️ Light"
              : "🌙 Dark"}
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex gap-3 items-start bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 px-4 py-3.5 rounded-xl mb-6">

          <span className="w-[22px] h-[22px] shrink-0 grid place-items-center bg-red-600 text-white rounded-full font-bold">
            !
          </span>

          <div>
            <strong className="block text-sm">
              Something went wrong
            </strong>

            <p className="text-sm mt-0.5">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/25 grid place-items-center text-xl">
            🚨
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 m-0">
              Active Emergencies
            </p>

            <strong className="text-2xl">
              {emergencies.length}
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/25 grid place-items-center text-xl">
            🚑
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 m-0">
              Ambulances Dispatched
            </p>

            <strong className="text-2xl">
              {
                emergencies.filter(
                  (e) =>
                    [
                      "AMBULANCE_ASSIGNED",
                      "ON_THE_WAY",
                      "ARRIVED",
                      "PATIENT_PICKED",
                    ].includes(e.status)
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-900/25 grid place-items-center text-xl">
            ⏱
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 m-0">
              Response Queue
            </p>

            <strong className="text-2xl">
              {emergencies.filter(
                (e) => e.status === "REQUESTED"
              ).length}
            </strong>
          </div>
        </div>

      </div>

      {/* EMPTY */}

      {emergencies.length === 0 ? (
        <div className="text-center bg-white dark:bg-[#0B1220] border border-dashed border-slate-300 dark:border-gray-700 rounded-2xl px-6 py-16">

          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/25 grid place-items-center text-2xl">
            🚑
          </div>

          <h2 className="text-lg font-semibold">
            No active emergency requests
          </h2>

          <p className="text-slate-500 dark:text-gray-400 text-sm mb-5">
            All emergency requests have been handled.
          </p>

          <button
            onClick={fetchEmergencies}
            className="border border-slate-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            ↻ Check Again
          </button>

        </div>
      ) : (

        <div>

          {/* SECTION */}

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-semibold m-0">
                Active Emergency Requests
              </h2>

              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                Track every emergency from request to completion.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/25 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              LIVE
            </div>

          </div>

          {/* CARDS */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {emergencies.map((emergency) => {

              const patient = emergency.patient;
              const hospital = emergency.hospital;

              const isUpdating =
                updatingId === emergency._id;

              const currentIndex =
                STATUS_STEPS.indexOf(
                  emergency.status
                );

              const nextAction =
                getNextAction(emergency);

              return (
                <div
                  key={emergency._id}
                  className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-gray-800 border-l-4 border-l-red-500 rounded-2xl overflow-hidden"
                >

                  {/* CARD TOP */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-900/25 text-teal-700 dark:text-teal-400 grid place-items-center font-bold">
                          {patient?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>

                        <div>
                          <h3 className="font-bold text-base m-0">
                            {patient?.name ||
                              "Unknown Patient"}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            Emergency ID:{" "}
                            {emergency._id.slice(-8)}
                          </p>
                        </div>

                      </div>

                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/25 px-2.5 py-1 rounded-full">
                        🚨 EMERGENCY
                      </span>

                    </div>

                    {/* STATUS */}

                    <div className="mt-5">

                      <div className="flex justify-between mb-2">

                        <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                          Current Status
                        </span>

                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                          {STATUS_LABELS[
                            emergency.status
                          ]}
                        </span>

                      </div>

                      {/* PROGRESS */}

                      <div className="flex items-center gap-1">

                        {STATUS_STEPS.map(
                          (step, index) => {

                            const completed =
                              index <= currentIndex;

                            return (
                              <React.Fragment key={step}>

                                <div
                                  title={
                                    STATUS_LABELS[
                                      step
                                    ]
                                  }
                                  className={`h-2 flex-1 rounded-full ${
                                    completed
                                      ? "bg-teal-600 dark:bg-teal-400"
                                      : "bg-slate-200 dark:bg-gray-700"
                                  }`}
                                />

                              </React.Fragment>
                            );
                          }
                        )}

                      </div>

                      <div className="flex justify-between mt-2 text-[9px] text-slate-400">
                        <span>Request</span>
                        <span>Assigned</span>
                        <span>Journey</span>
                        <span>Arrived</span>
                        <span>Picked</span>
                        <span>Done</span>
                      </div>

                    </div>

                    {/* REASON */}

                    <div className="mt-5 bg-red-50 dark:bg-red-900/20 rounded-xl p-3.5 flex gap-3">

                      <div className="text-lg">
                        ⚠️
                      </div>

                      <div>
                        <span className="block text-[11px] text-red-700 dark:text-red-300">
                          Emergency Reason
                        </span>

                        <strong className="text-sm text-red-900 dark:text-red-200">
                          {emergency.reason ||
                            "Emergency"}
                        </strong>
                      </div>

                    </div>

                    {/* PATIENT INFO */}

                    <div className="grid grid-cols-2 gap-3 mt-4">

                      <div>
                        <span className="text-[11px] text-slate-400">
                          Patient Email
                        </span>

                        <p className="text-sm font-medium break-all m-0 mt-0.5">
                          {patient?.email ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400">
                          Patient Phone
                        </span>

                        <p className="text-sm font-medium m-0 mt-0.5">
                          {patient?.phone_number ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400">
                          Hospital
                        </span>

                        <p className="text-sm font-medium m-0 mt-0.5">
                          {hospital?.name ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400">
                          Requested
                        </span>

                        <p className="text-sm font-medium m-0 mt-0.5">
                          {formatTime(
                            emergency.createdAt
                          )}
                        </p>
                      </div>

                    </div>

                    {/* MESSAGE */}

                    {emergency.message && (
                      <div className="mt-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                        <span className="text-[11px] text-slate-400">
                          Patient Message
                        </span>

                        <p className="text-sm mt-1 m-0 leading-relaxed">
                          {emergency.message}
                        </p>
                      </div>
                    )}

                    {/* AMBULANCE */}

                    <div className="mt-4 border border-slate-200 dark:border-gray-800 rounded-xl p-4">

                      <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            🚑
                          </span>

                          <strong className="text-sm">
                            Ambulance Details
                          </strong>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            emergency.ambulance
                              ?.vehicleNumber
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-gray-800"
                          }`}
                        >
                          {emergency.ambulance
                            ?.vehicleNumber
                            ? "ASSIGNED"
                            : "NOT ASSIGNED"}
                        </span>

                      </div>

                      <div className="grid grid-cols-3 gap-3">

                        <div>
                          <span className="block text-[10px] text-slate-400">
                            Vehicle
                          </span>

                          <strong className="text-sm">
                            {emergency.ambulance
                              ?.vehicleNumber ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-400">
                            Driver
                          </span>

                          <strong className="text-sm">
                            {emergency.ambulance
                              ?.driverName ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-400">
                            Phone
                          </span>

                          <strong className="text-sm">
                            {emergency.ambulance
                              ?.driverPhone ||
                              "—"}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* ACTION */}

                    {nextAction && (
                      <div className="mt-5">

                        {emergency.status ===
                        "ACKNOWLEDGED" ? (

                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              openAssignModal(
                                emergency
                              )
                            }
                            className={`w-full rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-50 ${nextAction.className}`}
                          >
                            {isUpdating
                              ? "Updating..."
                              : nextAction.label}
                          </button>

                        ) : (

                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusUpdate(
                                emergency._id,
                                nextAction.status
                              )
                            }
                            className={`w-full rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-50 ${nextAction.className}`}
                          >
                            {isUpdating
                              ? "Updating..."
                              : nextAction.label}
                          </button>

                        )}

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* =========================================
          ASSIGN AMBULANCE MODAL
      ========================================= */}

      {showAssignModal &&
        selectedEmergency && (

          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white dark:bg-[#0B1220] rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-gray-800">

                <div>
                  <h2 className="text-lg font-bold m-0">
                    Assign Ambulance
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Patient:{" "}
                    {selectedEmergency.patient?.name}
                  </p>
                </div>

                <button
                  onClick={closeAssignModal}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700"
                >
                  ✕
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleAssignAmbulance}
                className="p-5 space-y-4"
              >

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. BR-10-AB-1234"
                    value={
                      ambulanceData.vehicleNumber
                    }
                    onChange={(e) =>
                      setAmbulanceData({
                        ...ambulanceData,
                        vehicleNumber:
                          e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Driver Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter driver name"
                    value={
                      ambulanceData.driverName
                    }
                    onChange={(e) =>
                      setAmbulanceData({
                        ...ambulanceData,
                        driverName:
                          e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Driver Phone
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter driver phone"
                    value={
                      ambulanceData.driverPhone
                    }
                    onChange={(e) =>
                      setAmbulanceData({
                        ...ambulanceData,
                        driverPhone:
                          e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updatingId}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
                  >
                    {updatingId
                      ? "Assigning..."
                      : "🚑 Assign Ambulance"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default AmbulanceTracker;