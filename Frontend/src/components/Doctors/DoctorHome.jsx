// import React, { useEffect, useCallback } from "react";
// import DoctorCards from "./DoctorCards";
// import IntroSection from "../Hospitals/IntroSection";
// import QueueList from "./QueueList";
// import CurrentPatient from "./CurrentPatient";
// import OPDControls from "./OPDControls";
// import {
//   getConfirmedAppointments,
//   getCurrentPatient,
//   completeAppointment as completeAppointmentApi, // ⭐ API function, alag naam se
//   callNext as callNextApi,
//   skipPatient as skipPatientApi,
// } from "../../api/backend";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setOpdPaused,
//   setOpdStarted,
//   setCurrentAppointment,
//   setAppointments,
// } from "../../redux/slices/opdSlice";

// const DoctorHome = () => {
//   const dispatch = useDispatch();
//   const { opdStarted, opdPaused, currentAppointment, appointments } = useSelector(
//     (state) => state.opd
//   );

//   const fetchQueue = useCallback(async () => {
//     try {
//       const { data } = await getConfirmedAppointments();
//       dispatch(setAppointments(data.appointments || data));
//     } catch (error) {
//       console.log(error);
//     }
//   }, [dispatch]);

//   const fetchCurrentPatient = useCallback(async () => {
//     try {
//       const { data } = await getCurrentPatient();
//       dispatch(setCurrentAppointment(data.currentAppointment));
//       if (typeof data.opdPaused === "boolean") {
//         dispatch(setOpdPaused(data.opdPaused));
//       }
//     } catch (error) {
//           if (error.response?.status === 400 && error.response?.data?.message === "OPD not started") {
//             dispatch(setOpdStarted(false));
//             dispatch(setOpdPaused(false));
//             dispatch(setCurrentAppointment(null));
//           } else {
//             console.log(error);
//           }
//         }
//   }, [dispatch]);

//   useEffect(() => {
//     if (opdStarted) {
//       fetchCurrentPatient();
//       fetchQueue();
//     } else {
//       dispatch(setCurrentAppointment(null));
//       dispatch(setAppointments([]));
//     }
//   }, [opdStarted]);

//   // Complete → naya current patient + queue dono refresh karo
//   const handleComplete = async (id) => {
//     try {
//       const {data} = await completeAppointmentApi(id);
//       if(data.currentAppointment){
//         dispatch(setCurrentAppointment(data.currentAppointment));

//       }else{
//         dispatch(setCurrentAppointment(null));
//         if(data.message?.toLowerCase().includes("opd ended")){
//           dispatch(setOpdStarted(false));
//           dispatch(setOpdPaused(false));
//         }
//       }
//       fetchQueue();
//     } catch (error) {
//       console.error('[DoctorHome] complete appointment failed:', error);
//       alert(error.response?.data?.message || "Complete failed");
//     }
//   };

// const handleCallNext = async () => {
//   try {
//     const { data } = await callNextApi();
//     dispatch(setCurrentAppointment(data.currentAppointment || null));
//     if (!data.currentAppointment && data.message?.toLowerCase().includes("opd ended")) {
//       dispatch(setOpdStarted(false));
//       dispatch(setOpdPaused(false));
//     }
//     fetchQueue();
//   } catch (error) {
//     console.error(error);
//     alert(error.response?.data?.message || "Call next failed");
//   }
// };

// const handleSkip = async () => {
//   try {
//     const { data } = await skipPatientApi();
//     dispatch(setCurrentAppointment(data.currentAppointment || null));
//     if (!data.currentAppointment && data.message?.toLowerCase().includes("ended")) {
//       dispatch(setOpdStarted(false));
//       dispatch(setOpdPaused(false));
//     }
//     fetchQueue();
//   } catch (error) {
//     console.error(error);
//     alert(error.response?.data?.message || "Skip failed");
//   }
// };

//   return (
//     <div className="space-y-6">
//       <IntroSection />
//       <DoctorCards />
//       <OPDControls
//         opdStarted={opdStarted}
//         opdPaused={opdPaused}
//         currentAppointment={currentAppointment}
//         setOpdStarted={(val) => dispatch(setOpdStarted(val))}
//         setOpdPaused={(val) => dispatch(setOpdPaused(val))}
//         setCurrentAppointment={(val) => dispatch(setCurrentAppointment(val))}
//         refreshQueue={fetchQueue}
//       />

//       {opdStarted && (
//         <div className="h-screen flex gap-6">
//           <div className="flex-1 h-96">
//             <CurrentPatient
//               appointment={currentAppointment}
//               onComplete={handleComplete}
//               onSkip={handleSkip}
//               onCallNext={handleCallNext}
//             />
//           </div>
//           <div className="flex-1 h-96">
//             <QueueList appointments={appointments} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DoctorHome;


import React, { useEffect, useCallback } from "react";

import DoctorCards from "./DoctorCards";
import IntroSection from "../Hospitals/IntroSection";
import QueueList from "./QueueList";
import CurrentPatient from "./CurrentPatient";
import OPDControls from "./OPDControls";
import DoctorAnalytics from "../../features/doctor/DoctorAnalytics";

import {
  getConfirmedAppointments,
  getCurrentPatient,
  completeAppointment as completeAppointmentApi,
  callNext as callNextApi,
  skipPatient as skipPatientApi,
} from "../../api/backend";

import { useDispatch, useSelector } from "react-redux";

import {
  setOpdPaused,
  setOpdStarted,
  setCurrentAppointment,
  setAppointments,
} from "../../redux/slices/opdSlice";

const DoctorHome = () => {

  const dispatch = useDispatch();

  const {
    opdStarted,
    opdPaused,
    currentAppointment,
    appointments,
  } = useSelector((state) => state.opd);


  // ==========================================
  // FETCH QUEUE
  // ==========================================

  const fetchQueue = useCallback(async () => {
    try {

      const { data } =
        await getConfirmedAppointments();

      dispatch(
        setAppointments(
          data.appointments || data
        )
      );

    } catch (error) {

      console.log(
        "[DoctorHome] Queue fetch error:",
        error
      );

    }
  }, [dispatch]);


  // ==========================================
  // FETCH CURRENT PATIENT
  // ==========================================

  const fetchCurrentPatient = useCallback(async () => {

    try {

      const { data } =
        await getCurrentPatient();

      dispatch(
        setCurrentAppointment(
          data.currentAppointment || null
        )
      );

      if (
        typeof data.opdPaused === "boolean"
      ) {

        dispatch(
          setOpdPaused(
            data.opdPaused
          )
        );
      }

    } catch (error) {

      if (
        error.response?.status === 400 &&
        error.response?.data?.message ===
          "OPD not started"
      ) {

        dispatch(
          setOpdStarted(false)
        );

        dispatch(
          setOpdPaused(false)
        );

        dispatch(
          setCurrentAppointment(null)
        );

      } else {

        console.log(
          "[DoctorHome] Current patient error:",
          error
        );
      }
    }

  }, [dispatch]);


  // ==========================================
  // LOAD DATA WHEN OPD IS STARTED
  // ==========================================

  useEffect(() => {

    if (opdStarted) {

      fetchCurrentPatient();
      fetchQueue();

    } else {

      dispatch(
        setCurrentAppointment(null)
      );

      dispatch(
        setAppointments([])
      );
    }

  }, [
    opdStarted,
    fetchCurrentPatient,
    fetchQueue,
    dispatch
  ]);


  // ==========================================
  // COMPLETE APPOINTMENT
  // ==========================================

  const handleComplete = async (id) => {

    try {

      const { data } =
        await completeAppointmentApi(id);

      if (data.currentAppointment) {

        dispatch(
          setCurrentAppointment(
            data.currentAppointment
          )
        );

      } else {

        dispatch(
          setCurrentAppointment(null)
        );

        if (
          data.message
            ?.toLowerCase()
            .includes("opd ended")
        ) {

          dispatch(
            setOpdStarted(false)
          );

          dispatch(
            setOpdPaused(false)
          );
        }
      }

      fetchQueue();

    } catch (error) {

      console.error(
        "[DoctorHome] complete appointment failed:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Complete failed"
      );
    }
  };


  // ==========================================
  // CALL NEXT
  // ==========================================

  const handleCallNext = async () => {

    try {

      const { data } =
        await callNextApi();

      dispatch(
        setCurrentAppointment(
          data.currentAppointment || null
        )
      );

      if (
        !data.currentAppointment &&
        data.message
          ?.toLowerCase()
          .includes("opd ended")
      ) {

        dispatch(
          setOpdStarted(false)
        );

        dispatch(
          setOpdPaused(false)
        );
      }

      fetchQueue();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Call next failed"
      );
    }
  };


  // ==========================================
  // SKIP PATIENT
  // ==========================================

  const handleSkip = async () => {

    try {

      const { data } =
        await skipPatientApi();

      dispatch(
        setCurrentAppointment(
          data.currentAppointment || null
        )
      );

      if (
        !data.currentAppointment &&
        data.message
          ?.toLowerCase()
          .includes("ended")
      ) {

        dispatch(
          setOpdStarted(false)
        );

        dispatch(
          setOpdPaused(false)
        );
      }

      fetchQueue();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Skip failed"
      );
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="space-y-6">

      <IntroSection />

      <DoctorCards />

      {/* Redux handles OPD state */}
      <OPDControls
        refreshQueue={fetchQueue}
      />

      


      {opdStarted && (

        <div className="h-screen flex gap-6">

          <div className="flex-1 h-96">

            <CurrentPatient
              appointment={currentAppointment}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onCallNext={handleCallNext}
            />

          </div>


          <div className="flex-1 h-96">

            <QueueList
              appointments={appointments}
            />
          

          </div>

        </div>
      )}
      <DoctorAnalytics />

    </div>
  );
};

export default DoctorHome;