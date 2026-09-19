// import React, { useEffect, useState } from "react";
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Droplets,
//   Edit,
//   FileText,
//   Upload,
//   X,
//   Image as ImageIcon,
// } from "lucide-react";

// import { getPatientProfile, addPatientReport } from "../api/backend";
// import { useParams } from "react-router-dom";

// const PatientProfile = () => {
//   const { id } = useParams();

//   const [patient, setPatient] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Report states
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [reportLoading, setReportLoading] = useState(false);
//   const [reportError, setReportError] = useState("");
//   const [reportSuccess, setReportSuccess] = useState("");

//   const [reportData, setReportData] = useState({
//     title: "",
//     type: "",
//     file: null,
//   });

//   // ============================
//   // FETCH PATIENT PROFILE
//   // ============================

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);

//         if (!id) {
//           setError("Patient ID not found");
//           return;
//         }

//         const res = await getPatientProfile(id);

//         if (res.data.success) {
//           setPatient(res.data.patient);
//         } else {
//           setError(res.data.message || "Failed to fetch profile");
//         }
//       } catch (err) {
//         console.error("Profile fetch error:", err);

//         setError(
//           err.response?.data?.message ||
//             "Failed to load patient profile"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [id]);

//   // ============================
//   // FORMAT DATE
//   // ============================

//   const formatDate = (date) => {
//     if (!date) return "Not provided";

//     return new Date(date).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   };

//   // ============================
//   // REPORT INPUT CHANGE
//   // ============================

//   const handleReportChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "file") {
//       setReportData((prev) => ({
//         ...prev,
//         file: files[0] || null,
//       }));
//     } else {
//       setReportData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   // ============================
//   // ADD REPORT
//   // ============================

//   const handleAddReport = async (e) => {
//     e.preventDefault();

//     setReportError("");
//     setReportSuccess("");

//     if (!id) {
//       setReportError("Patient ID not found");
//       return;
//     }

//     if (!reportData.title.trim()) {
//       setReportError("Please enter report title");
//       return;
//     }

//     if (!reportData.type) {
//       setReportError("Please select report type");
//       return;
//     }

//     if (!reportData.file) {
//       setReportError("Please select a report file");
//       return;
//     }

//     try {
//       setReportLoading(true);

//       const formData = new FormData();

//       // patientId URL se
//       formData.append("patientId", id);

//       // title
//       formData.append("title", reportData.title);

//       // type
//       formData.append("type", reportData.type);

//       // file
//       formData.append("file", reportData.file);

//       // Debug
//       console.log("Patient ID:", id);
//       console.log("Report Title:", reportData.title);
//       console.log("Report Type:", reportData.type);
//       console.log("Report File:", reportData.file);

//       const res = await addPatientReport(formData);

//       if (res.data.success) {
//         setReportSuccess(
//           res.data.message || "Report added successfully"
//         );

//         // Reset form
//         setReportData({
//           title: "",
//           type: "",
//           file: null,
//         });

//         // input file reset karne ke liye modal close
//         setTimeout(() => {
//           setShowReportModal(false);
//           setReportSuccess("");
//         }, 1200);
//       } else {
//         setReportError(
//           res.data.message || "Failed to add report"
//         );
//       }
//     } catch (err) {
//       console.error("Add report error:", err);

//       setReportError(
//         err.response?.data?.message ||
//           "Failed to upload report"
//       );
//     } finally {
//       setReportLoading(false);
//     }
//   };

//   // ============================
//   // LOADING
//   // ============================

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
//         <div className="text-gray-500 dark:text-gray-400 text-lg">
//           Loading profile...
//         </div>
//       </div>
//     );
//   }

//   // ============================
//   // ERROR
//   // ============================

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
//         <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   if (!patient) return null;

//   // ============================
//   // UI
//   // ============================

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-black p-6">

//       <div className="max-w-5xl mx-auto">

//         {/* ================= HEADER ================= */}

//         <div className="flex items-center justify-between mb-6">

//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//               Patient Profile
//             </h1>

//             <p className="text-gray-500 dark:text-gray-400 mt-1">
//               View patient personal information and medical reports
//             </p>
//           </div>

//         </div>

//         {/* ================= PROFILE CARD ================= */}

//         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

//           {/* TOP SECTION */}

//           <div className="p-8 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900">

//             <div className="flex items-center gap-6">

//               {/* Profile Image */}

//               <div
//                 className="
//                   w-28 h-28 rounded-full overflow-hidden
//                   border-4 border-white dark:border-gray-800
//                   shadow-md
//                   bg-gray-200 dark:bg-gray-700
//                   flex items-center justify-center
//                 "
//               >

//                 {patient.profileImage ? (
//                   <img
//                     src={patient.profileImage}
//                     alt={patient.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <User
//                     size={50}
//                     className="text-gray-400 dark:text-gray-500"
//                   />
//                 )}

//               </div>

//               {/* NAME */}

//               <div>

//                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">
//                   {patient.name}
//                 </h2>

//                 <p className="text-gray-500 dark:text-gray-400 mt-1">
//                   Patient
//                 </p>

//                 <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-gray-300">
//                   <Mail size={17} />
//                   <span>{patient.email}</span>
//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* ================= PERSONAL INFORMATION ================= */}

//           <div className="p-8">

//             <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
//               Personal Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//               <InfoItem
//                 icon={<Calendar size={19} />}
//                 label="Date of Birth"
//                 value={formatDate(patient.dob)}
//               />

//               <InfoItem
//                 icon={<User size={19} />}
//                 label="Gender"
//                 value={patient.gender || "Not provided"}
//               />

//               <InfoItem
//                 icon={<Droplets size={19} />}
//                 label="Blood Group"
//                 value={patient.bloodGroup || "Not provided"}
//               />

//               <InfoItem
//                 icon={<Phone size={19} />}
//                 label="Phone Number"
//                 value={
//                   patient.phone_number || "Not provided"
//                 }
//               />

//             </div>

//           </div>

//           {/* ================= ADDRESS ================= */}

//           <div className="px-8 pb-8">

//             <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
//               Address
//             </h3>

//             <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">

//               <div className="flex gap-4">

//                 <div
//                   className="
//                     w-10 h-10 rounded-lg
//                     bg-blue-100 dark:bg-blue-900/40
//                     flex items-center justify-center
//                     text-blue-600 dark:text-blue-400
//                     shrink-0
//                   "
//                 >
//                   <MapPin size={20} />
//                 </div>

//                 <div>

//                   <p className="font-medium text-gray-800 dark:text-gray-100">
//                     {patient.address?.line ||
//                       "Address not provided"}
//                   </p>

//                   <p className="text-gray-600 dark:text-gray-300 mt-1">

//                     {patient.address?.city}

//                     {patient.address?.city &&
//                     patient.address?.state
//                       ? ", "
//                       : ""}

//                     {patient.address?.state}

//                   </p>

//                   <p className="text-gray-500 dark:text-gray-400 mt-1">
//                     Pincode:{" "}
//                     {patient.address?.pincode ||
//                       "Not provided"}
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* ================= ADD REPORT ================= */}

//           <div className="px-8 pb-8">

//             <div
//               className="
//                 border-t border-gray-100
//                 dark:border-gray-800
//                 pt-8
//               "
//             >

//               <div className="flex items-center justify-between">

//                 <div>

//                   <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
//                     Medical Reports
//                   </h3>

//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     Upload patient's medical reports
//                   </p>

//                 </div>

//                 <button
//                   onClick={() => {
//                     setShowReportModal(true);
//                     setReportError("");
//                     setReportSuccess("");
//                   }}
//                   className="
//                     flex items-center gap-2
//                     px-5 py-2.5
//                     bg-blue-600 hover:bg-blue-700
//                     text-white
//                     rounded-lg
//                     transition
//                     shadow-sm
//                   "
//                 >
//                   <FileText size={18} />
//                   Add Report
//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//       {/* ================================================= */}
//       {/* ADD REPORT MODAL */}
//       {/* ================================================= */}

//       {showReportModal && (

//         <div
//           className="
//             fixed inset-0 z-50
//             flex items-center justify-center
//             bg-black/50
//             backdrop-blur-sm
//             p-4
//           "
//         >

//           <div
//             className="
//               w-full max-w-lg
//               bg-white dark:bg-gray-900
//               rounded-2xl
//               shadow-2xl
//               border border-gray-100
//               dark:border-gray-800
//             "
//           >

//             {/* Modal Header */}

//             <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">

//               <div>

//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
//                   Add Medical Report
//                 </h2>

//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                   Upload a report for {patient.name}
//                 </p>

//               </div>

//               <button
//                 onClick={() => {
//                   if (!reportLoading) {
//                     setShowReportModal(false);
//                     setReportError("");
//                     setReportSuccess("");
//                   }
//                 }}
//                 className="
//                   p-2 rounded-lg
//                   hover:bg-gray-100
//                   dark:hover:bg-gray-800
//                   text-gray-500
//                 "
//               >
//                 <X size={20} />
//               </button>

//             </div>

//             {/* FORM */}

//             <form
//               onSubmit={handleAddReport}
//               className="p-6 space-y-5"
//             >

//               {/* Patient */}

//               <div>

//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Patient
//                 </label>

//                 <input
//                   type="text"
//                   value={patient.name}
//                   disabled
//                   className="
//                     w-full px-4 py-2.5
//                     rounded-lg
//                     border border-gray-200
//                     dark:border-gray-700
//                     bg-gray-100 dark:bg-gray-800
//                     text-gray-500 dark:text-gray-400
//                   "
//                 />

//               </div>

//               {/* Title */}

//               <div>

//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Report Title
//                 </label>

//                 <input
//                   type="text"
//                   name="title"
//                   value={reportData.title}
//                   onChange={handleReportChange}
//                   placeholder="e.g. Blood Test Report"
//                   className="
//                     w-full px-4 py-2.5
//                     rounded-lg
//                     border border-gray-200
//                     dark:border-gray-700
//                     bg-white dark:bg-gray-800
//                     text-gray-800 dark:text-gray-100
//                     outline-none
//                     focus:ring-2 focus:ring-blue-500
//                   "
//                 />

//               </div>

//               {/* TYPE */}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Report Type
//                 </label>

//                 <select
//                   name="type"
//                   value={reportData.type}
//                   onChange={handleReportChange}
//                   className="
//                     w-full px-4 py-2.5
//                     rounded-lg
//                     border border-gray-200
//                     dark:border-gray-700
//                     bg-white dark:bg-gray-800
//                     text-gray-800 dark:text-gray-100
//                     outline-none
//                     focus:ring-2 focus:ring-blue-500
//                   "
//                 >
//                   <option value="">
//                     Select report type
//                   </option>

//                   <option value="LAB">
//                     Lab Report
//                   </option>

//                   <option value="XRAY">
//                     X-Ray
//                   </option>

//                   <option value="MRI">
//                     MRI
//                   </option>

//                   <option value="OTHER">
//                     Other
//                   </option>
//                 </select>
//               </div>

//               {/* FILE */}

//               <div>

//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Report File
//                 </label>

//                 <label
//                   className="
//                     flex flex-col items-center justify-center
//                     w-full h-36
//                     border-2 border-dashed
//                     border-gray-300 dark:border-gray-700
//                     rounded-xl
//                     cursor-pointer
//                     bg-gray-50 dark:bg-gray-800
//                     hover:bg-gray-100
//                     dark:hover:bg-gray-750
//                     transition
//                   "
//                 >

//                   {reportData.file ? (

//                     <>

//                       <ImageIcon
//                         size={30}
//                         className="text-blue-500 mb-2"
//                       />

//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                         {reportData.file.name}
//                       </p>

//                       <p className="text-xs text-gray-500 mt-1">
//                         Click to change file
//                       </p>

//                     </>

//                   ) : (

//                     <>

//                       <Upload
//                         size={30}
//                         className="text-gray-400 mb-2"
//                       />

//                       <p className="text-sm text-gray-600 dark:text-gray-300">
//                         Click to upload report
//                       </p>

//                       <p className="text-xs text-gray-400 mt-1">
//                         PDF, JPG, PNG
//                       </p>

//                     </>

//                   )}

//                   <input
//                     type="file"
//                     name="file"
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     onChange={handleReportChange}
//                     className="hidden"
//                   />

//                 </label>

//               </div>

//               {/* ERROR */}

//               {reportError && (

//                 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
//                   {reportError}
//                 </div>

//               )}

//               {/* SUCCESS */}

//               {reportSuccess && (

//                 <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
//                   {reportSuccess}
//                 </div>

//               )}

//               {/* BUTTONS */}

//               <div className="flex justify-end gap-3 pt-2">

//                 <button
//                   type="button"
//                   disabled={reportLoading}
//                   onClick={() => {
//                     setShowReportModal(false);
//                     setReportError("");
//                   }}
//                   className="
//                     px-4 py-2.5
//                     rounded-lg
//                     border border-gray-200
//                     dark:border-gray-700
//                     text-gray-600 dark:text-gray-300
//                     hover:bg-gray-100
//                     dark:hover:bg-gray-800
//                   "
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={reportLoading}
//                   className="
//                     flex items-center gap-2
//                     px-5 py-2.5
//                     rounded-lg
//                     bg-blue-600
//                     hover:bg-blue-700
//                     disabled:opacity-50
//                     text-white
//                   "
//                 >

//                   {reportLoading ? (
//                     "Uploading..."
//                   ) : (
//                     <>
//                       <Upload size={18} />
//                       Upload Report
//                     </>
//                   )}

//                 </button>

//               </div>

//             </form>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// };


// /* ================================================= */
// /* REUSABLE INFORMATION ITEM */
// /* ================================================= */

// const InfoItem = ({ icon, label, value }) => {
//   return (
//     <div
//       className="
//         flex items-center gap-4
//         p-4 rounded-xl
//         border border-gray-100
//         dark:border-gray-700
//         bg-gray-50 dark:bg-gray-800
//       "
//     >

//       <div
//         className="
//           w-10 h-10 rounded-lg
//           bg-blue-100 dark:bg-blue-900/40
//           flex items-center justify-center
//           text-blue-600 dark:text-blue-400
//           shrink-0
//         "
//       >
//         {icon}
//       </div>

//       <div>

//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           {label}
//         </p>

//         <p className="font-medium text-gray-800 dark:text-gray-100 mt-1">
//           {value}
//         </p>

//       </div>

//     </div>
//   );
// };

// export default PatientProfile;






import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Droplets,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getPatientProfile } from "../api/backend";

const PatientProfile = () => {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("Patient ID not found");
          return;
        }

        const res = await getPatientProfile(id);

        console.log("Patient profile response:", res.data);

        if (res.data.success) {
          setPatient(res.data.patient);
        } else {
          setError(
            res.data.message || "Failed to fetch patient profile"
          );
        }
      } catch (err) {
        console.error("Profile fetch error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load patient profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          Loading patient profile...
        </div>
      </div>
    );
  }

  // ---------------- ERROR ----------------

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="w-full">

      {/* ================= HEADER ================= */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Patient Profile
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View patient personal and contact information
        </p>
      </div>

      {/* ================= PROFILE CARD ================= */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* ================= TOP SECTION ================= */}

        <div
          className="
            p-8
            bg-gradient-to-r
            from-blue-50
            to-white
            dark:from-blue-950/30
            dark:to-gray-900
          "
        >
          <div className="flex items-center gap-6">

            {/* PROFILE IMAGE */}

            <div
              className="
                w-28 h-28
                rounded-full
                overflow-hidden
                border-4
                border-white
                dark:border-gray-800
                shadow-md
                bg-gray-200
                dark:bg-gray-700
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              {patient.profileImage ? (
                <img
                  src={patient.profileImage}
                  alt={patient.name || "Patient"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User
                  size={50}
                  className="text-gray-400 dark:text-gray-500"
                />
              )}
            </div>

            {/* PATIENT NAME */}

            <div className="min-w-0">

              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                  dark:text-gray-100
                  capitalize
                "
              >
                {patient.name || "Unknown Patient"}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Patient
              </p>

              {/* EMAIL */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-3
                  text-gray-600
                  dark:text-gray-300
                "
              >
                <Mail size={17} />

                <span className="truncate">
                  {patient.email || "No email"}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ================= PERSONAL INFORMATION ================= */}

        <div className="p-8">

          <h3
            className="
              text-xl
              font-semibold
              text-gray-800
              dark:text-gray-100
              mb-6
            "
          >
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* DOB */}

            <InfoItem
              icon={<Calendar size={19} />}
              label="Date of Birth"
              value={formatDate(patient.dob)}
            />

            {/* GENDER */}

            <InfoItem
              icon={<User size={19} />}
              label="Gender"
              value={patient.gender || "Not provided"}
            />

            {/* BLOOD GROUP */}

            <InfoItem
              icon={<Droplets size={19} />}
              label="Blood Group"
              value={patient.bloodGroup || "Not provided"}
            />

            {/* PHONE */}

            <InfoItem
              icon={<Phone size={19} />}
              label="Phone Number"
              value={patient.phone_number || "Not provided"}
            />

          </div>
        </div>

        {/* ================= ADDRESS ================= */}

        <div className="px-8 pb-8">

          <h3
            className="
              text-xl
              font-semibold
              text-gray-800
              dark:text-gray-100
              mb-6
            "
          >
            Address
          </h3>

          <div
            className="
              bg-gray-50
              dark:bg-gray-800
              rounded-xl
              p-5
            "
          >

            <div className="flex gap-4">

              {/* MAP ICON */}

              <div
                className="
                  w-10 h-10
                  rounded-lg
                  bg-blue-100
                  dark:bg-blue-900/40
                  flex
                  items-center
                  justify-center
                  text-blue-600
                  dark:text-blue-400
                  shrink-0
                "
              >
                <MapPin size={20} />
              </div>

              {/* ADDRESS DETAILS */}

              <div>

                {/* LINE */}

                <p
                  className="
                    font-medium
                    text-gray-800
                    dark:text-gray-100
                  "
                >
                  {patient.address?.line ||
                    "Address not provided"}
                </p>

                {/* CITY + STATE */}

                {(patient.address?.city ||
                  patient.address?.state) && (
                  <p
                    className="
                      text-gray-600
                      dark:text-gray-300
                      mt-1
                    "
                  >
                    {patient.address?.city}

                    {patient.address?.city &&
                    patient.address?.state
                      ? ", "
                      : ""}

                    {patient.address?.state}
                  </p>
                )}

                {/* PINCODE */}

                <p
                  className="
                    text-gray-500
                    dark:text-gray-400
                    mt-1
                  "
                >
                  Pincode:{" "}
                  {patient.address?.pincode ||
                    "Not provided"}
                </p>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


/* =====================================================
   REUSABLE INFO ITEM
===================================================== */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-4
        rounded-xl
        border
        border-gray-100
        dark:border-gray-700
        bg-gray-50
        dark:bg-gray-800
      "
    >

      {/* ICON */}

      <div
        className="
          w-10 h-10
          rounded-lg
          bg-blue-100
          dark:bg-blue-900/40
          flex
          items-center
          justify-center
          text-blue-600
          dark:text-blue-400
          shrink-0
        "
      >
        {icon}
      </div>

      {/* TEXT */}

      <div className="min-w-0">

        <p
          className="
            text-sm
            text-gray-500
            dark:text-gray-400
          "
        >
          {label}
        </p>

        <p
          className="
            font-medium
            text-gray-800
            dark:text-gray-100
            mt-1
            break-words
          "
        >
          {value}
        </p>

      </div>
    </div>
  );
};

export default PatientProfile;