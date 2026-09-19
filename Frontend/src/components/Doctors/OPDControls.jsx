// import React, { useState } from "react";
// import {
//   startOPD,
//   startConsultation,
//   stopConsultation,
//   pauseConsultation,
//   resumeConsultation
// } from "../../api/backend";

// const OPDControls = ({
//   opdStarted,
//   opdPaused,
//   currentAppointment,
//   setOpdStarted,
//   setOpdPaused,
//   setCurrentAppointment,
//   refreshQueue // parent se aaya function jo queue list refetch kare
// }) => {
//   const [loading, setLoading] = useState(false);

//   const handleOPDToggle = async () => {
//     try {
//       setLoading(true);
//       if (!opdStarted) {
//         // Start OPD
//         await startOPD();
//         setOpdStarted(true);
//       } else {
//         // Stop OPD — poora session end karo
//         await stopConsultation();
//         setOpdStarted(false);
//         setOpdPaused(false);
//         setCurrentAppointment(null);
//       }
//     } catch (error) {
//       console.error(error);
//       alert(error.response?.data?.message || "OPD toggle failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartConsultation = async () => {
//     try {
//       setLoading(true);
//       const res = await startConsultation();
//       setCurrentAppointment(res.data.currentAppointment);
//       setOpdPaused(false);
//       refreshQueue?.(); // queue se yeh patient hat jaayega
//     } catch (error) {
//       console.error(error);
//       alert(error.response?.data?.message || "No patients in queue");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePauseConsultation = async () => {
//     try {
//       setLoading(true);
//       await pauseConsultation();
//       setOpdPaused(true);
//     } catch (error) {
//       console.error(error);
//       alert(error.response?.data?.message || "Pause failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResumeConsultation = async () => {
//     try {
//       setLoading(true);
//       await resumeConsultation();
//       setOpdPaused(false);
//     } catch (error) {
//       console.error(error);
//       alert(error.response?.data?.message || "Resume failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl shadow flex-wrap">

//       {/* Start / Stop OPD — hamesha visible */}
//       <button
//         onClick={handleOPDToggle}
//         disabled={loading}
//         className={`px-6 py-3 rounded-lg text-white font-medium ${
//           opdStarted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
//         }`}
//       >
//         {opdStarted ? "Stop OPD" : "Start OPD"}
//       </button>

//       {/* Start Consultation — sirf jab koi current patient nahi hai */}
//       {opdStarted && !opdPaused && !currentAppointment && (
//         <button
//           onClick={handleStartConsultation}
//           disabled={loading}
//           className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400"
//         >
//           Start Consultation
//         </button>
//       )}

//       {/* Pause — sirf jab consultation chal rahi ho */}
//       {opdStarted && !opdPaused && currentAppointment && (
//         <button
//           onClick={handlePauseConsultation}
//           disabled={loading}
//           className="px-6 py-3 rounded-lg bg-yellow-500 text-white disabled:bg-gray-400"
//         >
//           Pause Consultation
//         </button>
//       )}

//       {/* Resume — sirf jab paused ho */}
//       {opdStarted && opdPaused && (
//         <button
//           onClick={handleResumeConsultation}
//           disabled={loading}
//           className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400"
//         >
//           Resume Consultation
//         </button>
//       )}
//     </div>
//   );
// };

// export default OPDControls;



import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pauseConsultation, resumeConsultation, startConsultation, startOPD, stopConsultation } from "../../api/backend";
import { resetOpd, setCurrentAppointment, setOpdPaused, setOpdStarted } from "../../redux/slices/opdSlice";

const OPDControls = ({ refreshQueue }) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const {
    opdStarted,
    opdPaused,
    currentAppointment,
  } = useSelector((state) => state.opd);

  // =========================
  // START / STOP OPD
  // =========================
  const handleOPDToggle = async () => {
    try {
      setLoading(true);

      if (!opdStarted) {
        // START OPD
        await startOPD();

        dispatch(setOpdStarted(true));
        dispatch(setOpdPaused(false));

      } else {
        // STOP OPD
        await stopConsultation();

        dispatch(resetOpd());
      }

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "OPD toggle failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // START CONSULTATION
  // =========================
  const handleStartConsultation = async () => {
    try {
      setLoading(true);

      const res = await startConsultation();

      dispatch(
        setCurrentAppointment(
          res.data.currentAppointment
        )
      );

      dispatch(setOpdPaused(false));

      refreshQueue?.();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "No patients in queue"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAUSE
  // =========================
  const handlePauseConsultation = async () => {
    try {
      setLoading(true);

      await pauseConsultation();

      dispatch(setOpdPaused(true));

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Pause failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESUME
  // =========================
  const handleResumeConsultation = async () => {
    try {
      setLoading(true);

      await resumeConsultation();

      dispatch(setOpdPaused(false));

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Resume failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl shadow flex-wrap">

      {/* START / STOP OPD */}
      <button
        onClick={handleOPDToggle}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-medium ${
          opdStarted
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {opdStarted
          ? "Stop OPD"
          : "Start OPD"}
      </button>

      {/* START CONSULTATION */}
      {opdStarted &&
        !opdPaused &&
        !currentAppointment && (
          <button
            onClick={handleStartConsultation}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400"
          >
            Start Consultation
          </button>
        )}

      {/* PAUSE */}
      {opdStarted &&
        !opdPaused &&
        currentAppointment && (
          <button
            onClick={handlePauseConsultation}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-yellow-500 text-white disabled:bg-gray-400"
          >
            Pause Consultation
          </button>
        )}

      {/* RESUME */}
      {opdStarted &&
        opdPaused && (
          <button
            onClick={handleResumeConsultation}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400"
          >
            Resume Consultation
          </button>
        )}

    </div>
  );
};

export default OPDControls;