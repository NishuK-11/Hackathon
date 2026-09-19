// import React, { useEffect, useState, useRef } from "react";
// import AccessFeatures from "../features/doctor/AccessFeatures";
// import DoctorHome from "../components/Doctors/DoctorHome";
// import { getDoctorStatus } from "../api/backend";
// import socket from "../socket";
// import { useDispatch, useSelector } from "react-redux";
// import { addNotification } from "../redux/slices/notificationSlice";

// const DoctorDashboard = () => {
//   const dispatch = useDispatch();

//   const [doctorStatus, setDoctorStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [localStream, setLocalStream] = useState(null);
//   const [patientSocketId, setPatientSocketId] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   const videoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   // WebRTC Peer Connection
//   const peerConnection = useRef(null);

//   // Debug interval
//   const statsIntervalRef = useRef(null);

//   // IMPORTANT:
//   // Remote description aane se pehle agar ICE candidate aa jaye
//   // to temporarily yahan store karenge
//   const pendingIceCandidates = useRef([]);

//   // Latest local stream reference for cleanup
//   const localStreamRef = useRef(null);


//   // =========================================================
//   // PATIENT ONLINE
//   // =========================================================
//   useEffect(() => {
//     const handlePatientOnline = (data) => {
//       console.log("🟢 Patient online:", data.patientId);
//       console.log("Patient socket ID:", data.socketId);

//       setPatientSocketId(data.socketId);
//     };

//     socket.on("patient-online", handlePatientOnline);

//     return () => {
//       socket.off("patient-online", handlePatientOnline);
//     };
//   }, []);


//   // =========================================================
//   // START CAMERA
//   // =========================================================
//   const startCamera = async () => {
//     try {
//       // Agar already camera start hai to dubara mat start karo
//       if (localStreamRef.current) {
//         console.log("🎥 Camera already running");
//         return;
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localStreamRef.current = stream;
//       setLocalStream(stream);

//       console.log("🎥 Camera + microphone started");

//       console.log(
//         "Video tracks:",
//         stream.getVideoTracks()
//       );

//       console.log(
//         "Audio tracks:",
//         stream.getAudioTracks()
//       );

//     } catch (error) {
//       console.error("❌ Camera/Mic error:", error);
//     }
//   };


//   // =========================================================
//   // CLEANUP PEER CONNECTION
//   // =========================================================
//   const cleanupPeerConnection = () => {

//     // Clear debug interval
//     if (statsIntervalRef.current) {
//       clearInterval(statsIntervalRef.current);
//       statsIntervalRef.current = null;
//     }

//     // Clear pending ICE candidates
//     pendingIceCandidates.current = [];

//     // Close old connection
//     if (peerConnection.current) {
//       console.log("🧹 Closing previous PeerConnection");

//       peerConnection.current.onicecandidate = null;
//       peerConnection.current.ontrack = null;
//       peerConnection.current.onconnectionstatechange = null;
//       peerConnection.current.oniceconnectionstatechange = null;

//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     setRemoteStream(null);
//   };


//   // =========================================================
//   // CALL PATIENT
//   // =========================================================
//   const callPatient = async () => {
//     try {

//       if (!localStreamRef.current) {
//         alert("Start camera first");
//         return;
//       }

//       if (!patientSocketId) {
//         alert("Patient is not connected");
//         return;
//       }

//       // Old call cleanup
//       cleanupPeerConnection();


//       // =====================================================
//       // CREATE PEER CONNECTION
//       // =====================================================
//       const pc = new RTCPeerConnection({

//         iceServers: [

//           // STUN
//           {
//             urls: "stun:stun.l.google.com:19302",
//           },

//           // TURN
//           {
//             urls: "turn:openrelay.metered.ca:80",
//             username: "openrelayproject",
//             credential: "openrelayproject",
//           },

//           {
//             urls: "turn:openrelay.metered.ca:443",
//             username: "openrelayproject",
//             credential: "openrelayproject",
//           },

//           {
//             urls:
//               "turn:openrelay.metered.ca:443?transport=tcp",
//             username: "openrelayproject",
//             credential: "openrelayproject",
//           },
//         ],
//       });

//       peerConnection.current = pc;


//       // =====================================================
//       // DEBUG WEBRTC STATES
//       // =====================================================
//       statsIntervalRef.current = setInterval(async () => {

//         const currentPC = peerConnection.current;

//         if (!currentPC) {
//           clearInterval(statsIntervalRef.current);
//           statsIntervalRef.current = null;
//           return;
//         }

//         console.log("\n========== WEBRTC STATE ==========");
//         console.log(
//           "Connection State:",
//           currentPC.connectionState
//         );
//         console.log(
//           "ICE State:",
//           currentPC.iceConnectionState
//         );
//         console.log(
//           "Signaling State:",
//           currentPC.signalingState
//         );

//         try {

//           const stats = await currentPC.getStats();

//           stats.forEach((report) => {

//             if (
//               report.type === "inbound-rtp" &&
//               (
//                 report.kind === "video" ||
//                 report.mediaType === "video"
//               )
//             ) {

//               console.log("📥 INBOUND VIDEO STATS:", {
//                 packetsReceived:
//                   report.packetsReceived,

//                 bytesReceived:
//                   report.bytesReceived,

//                 framesReceived:
//                   report.framesReceived,

//                 framesDecoded:
//                   report.framesDecoded,

//                 frameWidth:
//                   report.frameWidth,

//                 frameHeight:
//                   report.frameHeight,
//               });
//             }
//           });

//         } catch (error) {
//           console.log("Stats error:", error);
//         }

//       }, 2000);


//       // =====================================================
//       // ADD DOCTOR CAMERA + MIC TRACKS
//       // =====================================================
//       localStreamRef.current.getTracks().forEach((track) => {

//         console.log(
//           "➕ Adding local track:",
//           track.kind
//         );

//         pc.addTrack(
//           track,
//           localStreamRef.current
//         );
//       });


//       // =====================================================
//       // SEND DOCTOR ICE CANDIDATES TO PATIENT
//       // =====================================================
//       pc.onicecandidate = (event) => {

//         if (event.candidate) {

//           const candidateString =
//             event.candidate.candidate;

//           // Candidate type identify
//           let type = "unknown";

//           if (candidateString.includes("typ host")) {
//             type = "HOST";
//           } else if (
//             candidateString.includes("typ srflx")
//           ) {
//             type = "SRFLX (STUN)"
//           } else if (
//             candidateString.includes("typ relay")
//           ) {
//             type = "RELAY (TURN)"
//           }

//           console.log(
//             `🧊 DOCTOR ICE CANDIDATE [${type}]`,
//             event.candidate
//           );

//           socket.emit("ice-candidate", {
//             targetSocketId: patientSocketId,
//             candidate: event.candidate,
//           });

//         } else {

//           console.log(
//             "🏁 Doctor ICE gathering completed"
//           );
//         }
//       };


//       // =====================================================
//       // ICE SERVER ERROR
//       // =====================================================
//       pc.onicecandidateerror = (event) => {

//         console.warn("⚠️ ICE SERVER ERROR:", {
//           errorCode: event.errorCode,
//           errorText: event.errorText,
//           url: event.url,
//         });

//       };


//       // =====================================================
//       // CONNECTION STATE
//       // =====================================================
//       pc.onconnectionstatechange = () => {

//         console.log(
//           "🔗 CONNECTION STATE:",
//           pc.connectionState
//         );

//         if (
//           pc.connectionState === "failed" ||
//           pc.connectionState === "closed"
//         ) {

//           console.log(
//             "❌ WebRTC connection ended"
//           );
//         }
//       };


//       // =====================================================
//       // ICE CONNECTION STATE
//       // =====================================================
//       pc.oniceconnectionstatechange = () => {

//         console.log(
//           "🧊 ICE CONNECTION STATE:",
//           pc.iceConnectionState
//         );
//       };


//       // =====================================================
//       // RECEIVE PATIENT AUDIO/VIDEO
//       // =====================================================
//       pc.ontrack = (event) => {

//         console.log(
//           "📺 PATIENT REMOTE TRACK RECEIVED"
//         );

//         console.log(
//           "Track kind:",
//           event.track.kind
//         );

//         if (
//           event.streams &&
//           event.streams[0]
//         ) {

//           const stream = event.streams[0];

//           console.log(
//             "📺 Patient remote stream received"
//           );

//           console.log(
//             "Video tracks:",
//             stream.getVideoTracks()
//           );

//           console.log(
//             "Audio tracks:",
//             stream.getAudioTracks()
//           );

//           setRemoteStream(stream);
//         }
//       };


//       // =====================================================
//       // CREATE OFFER
//       // =====================================================
//       console.log("📤 Creating WebRTC offer...");

//       const offer = await pc.createOffer();

//       await pc.setLocalDescription(offer);

//       console.log(
//         "✅ Local description (offer) set"
//       );


//       // =====================================================
//       // SEND OFFER TO PATIENT
//       // =====================================================
//       socket.emit("call-user", {

//         targetSocketId: patientSocketId,

//         offer: {
//           type: pc.localDescription.type,
//           sdp: pc.localDescription.sdp,
//         },

//       });

//       console.log(
//         "📞 Call sent to patient"
//       );

//     } catch (error) {

//       console.error(
//         "❌ Call failed:",
//         error
//       );
//     }
//   };


//   // =========================================================
//   // RECEIVE CALL ANSWER FROM PATIENT
//   // =========================================================
//   useEffect(() => {

//     const handleCallAccepted = async (data) => {

//       console.log("📲 CALL ACCEPTED!");

//       console.log(
//         "Answer received:",
//         data.answer
//       );

//       try {

//         const pc = peerConnection.current;

//         if (!pc) {

//           console.error(
//             "❌ PeerConnection not found"
//           );

//           return;
//         }


//         // Set Patient Answer
//         await pc.setRemoteDescription(
//           new RTCSessionDescription(
//             data.answer
//           )
//         );

//         console.log(
//           "✅ Doctor remote answer set"
//         );


//         // ===================================================
//         // ADD QUEUED ICE CANDIDATES
//         // ===================================================

//         console.log(
//           "📦 Pending ICE candidates:",
//           pendingIceCandidates.current.length
//         );

//         for (
//           const candidate of pendingIceCandidates.current
//         ) {

//           try {

//             await pc.addIceCandidate(
//               new RTCIceCandidate(candidate)
//             );

//             console.log(
//               "✅ Queued patient ICE candidate added"
//             );

//           } catch (error) {

//             console.error(
//               "❌ Error adding queued ICE:",
//               error
//             );
//           }
//         }


//         // Clear queue
//         pendingIceCandidates.current = [];

//       } catch (error) {

//         console.error(
//           "❌ Error setting remote answer:",
//           error
//         );
//       }
//     };


//     socket.on(
//       "call-accepted",
//       handleCallAccepted
//     );


//     return () => {

//       socket.off(
//         "call-accepted",
//         handleCallAccepted
//       );
//     };

//   }, []);


//   // =========================================================
//   // RECEIVE PATIENT ICE CANDIDATES
//   // =========================================================
//   useEffect(() => {

//     const handleIceCandidate = async (data) => {

//       try {

//         console.log(
//           "🧊 RECEIVED PATIENT ICE CANDIDATE:",
//           data
//         );

//         const pc = peerConnection.current;

//         if (!pc || !data.candidate) {

//           console.warn(
//             "⚠️ PeerConnection or candidate missing"
//           );

//           return;
//         }


//         // IMPORTANT:
//         // Remote description abhi nahi aayi
//         // to candidate queue kar do

//         if (!pc.remoteDescription) {

//           console.log(
//             "⏳ Remote description not ready → queueing ICE candidate"
//           );

//           pendingIceCandidates.current.push(
//             data.candidate
//           );

//           return;
//         }


//         // Remote description exists
//         await pc.addIceCandidate(
//           new RTCIceCandidate(
//             data.candidate
//           )
//         );

//         console.log(
//           "✅ Patient ICE candidate added"
//         );

//       } catch (error) {

//         console.error(
//           "❌ Error adding patient ICE candidate:",
//           error
//         );
//       }
//     };


//     socket.on(
//       "ice-candidate",
//       handleIceCandidate
//     );


//     return () => {

//       socket.off(
//         "ice-candidate",
//         handleIceCandidate
//       );
//     };

//   }, []);


//   // =========================================================
//   // ATTACH REMOTE VIDEO
//   // =========================================================
//   useEffect(() => {

//     const video = remoteVideoRef.current;

//     if (!video || !remoteStream) {
//       return;
//     }

//     console.log(
//       "🎬 Attaching patient stream to video"
//     );

//     video.srcObject = remoteStream;

//     video.play()
//       .then(() => {

//         console.log(
//           "▶️ Remote video PLAYING"
//         );

//       })
//       .catch((error) => {

//         console.error(
//           "❌ Remote video play failed:",
//           error
//         );
//       });

//   }, [remoteStream]);


//   // =========================================================
//   // ATTACH LOCAL VIDEO
//   // =========================================================
//   useEffect(() => {

//     if (
//       videoRef.current &&
//       localStream
//     ) {

//       videoRef.current.srcObject =
//         localStream;
//     }

//   }, [localStream]);


//   // =========================================================
//   // NOTIFICATIONS
//   // =========================================================
//   useEffect(() => {

//     const handleNewAppointment = (data) => {

//       dispatch(
//         addNotification({

//           id: data.appointmentId,

//           message: data.message,

//           appointmentId:
//             data.appointmentId,

//           patientId:
//             data.patientId,

//           date:
//             data.date,

//           type:
//             "NEW_APPOINTMENT",

//           createdAt:
//             new Date().toISOString(),
//         })
//       );
//     };


//     socket.on(
//       "new-appointment",
//       handleNewAppointment
//     );


//     return () => {

//       socket.off(
//         "new-appointment",
//         handleNewAppointment
//       );
//     };

//   }, [dispatch]);


//   // =========================================================
//   // FETCH DOCTOR STATUS
//   // =========================================================
//   const fetchDoctorStatus = async () => {

//     try {

//       const res =
//         await getDoctorStatus();

//       setDoctorStatus(
//         res.data
//       );

//     } catch (error) {

//       console.error(error);

//     } finally {

//       setLoading(false);
//     }
//   };


//   useEffect(() => {

//     fetchDoctorStatus();

//   }, []);


//   // =========================================================
//   // SOCKET CONNECTION
//   // =========================================================
//   const user =
//     useSelector(
//       (state) => state.auth.user
//     );

//   const doctorId =
//     user?.doctorId;


//   useEffect(() => {

//     if (!doctorId) return;

//     socket.connect();

//     socket.emit(
//       "joinDoctor",
//       doctorId
//     );

//     console.log(
//       "🩺 Doctor joined socket:",
//       doctorId
//     );


//     return () => {

//       // Note:
//       // Agar same global socket app ke aur components use kar rahe hain,
//       // to blindly disconnect karna problematic ho sakta hai.
//       socket.disconnect();
//     };

//   }, [doctorId]);


//   // =========================================================
//   // COMPONENT CLEANUP
//   // =========================================================
//   useEffect(() => {

//     return () => {

//       console.log(
//         "🧹 DoctorDashboard unmount cleanup"
//       );

//       cleanupPeerConnection();

//       if (localStreamRef.current) {

//         localStreamRef.current
//           .getTracks()
//           .forEach((track) => {

//             track.stop();

//           });

//         localStreamRef.current = null;
//       }
//     };

//   }, []);


//   // =========================================================
//   // LOADING
//   // =========================================================
//   if (loading) {

//     return <div>Loading...</div>;
//   }


//   // =========================================================
//   // UI
//   // =========================================================
//   return (

//     <>

//       <button
//         onClick={startCamera}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         Start Camera
//       </button>


//       <button
//         onClick={callPatient}
//         className="px-4 py-2 bg-green-600 text-white rounded ml-2"
//       >
//         Call Patient
//       </button>


//       {/* LOCAL VIDEO */}

//       {localStream && (

//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-96 rounded-lg"
//         />

//       )}


//       {/* REMOTE PATIENT VIDEO */}

//       {remoteStream && (

//         <div className="mt-4">

//           <p className="text-lg font-bold">
//             Patient Video
//           </p>

//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             controls
//             className="w-[500px] h-[350px] bg-black rounded-lg object-cover"
//           />

//         </div>

//       )}


//       {/* MAIN AREA */}

//       <div>

//         {doctorStatus?.profileCompleted ? (

//           <DoctorHome />

//         ) : (

//           <AccessFeatures
//             doctorStatus={doctorStatus}
//             refreshDoctorStatus={
//               fetchDoctorStatus
//             }
//           />

//         )}

//       </div>

//     </>
//   );
// };

// export default DoctorDashboard;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessFeatures from "../features/doctor/AccessFeatures";
import DoctorHome from "../components/Doctors/DoctorHome";
import { getDoctorStatus } from "../api/backend";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../redux/slices/notificationSlice";

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [doctorStatus, setDoctorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientSocketId, setPatientSocketId] = useState(null);

  // PATIENT ONLINE
  useEffect(() => {
    const handlePatientOnline = (data) => {
      console.log("🟢 Patient online:", data.patientId);
      setPatientSocketId(data.socketId);
    };

    socket.on("patient-online", handlePatientOnline);
    return () => socket.off("patient-online", handlePatientOnline);
  }, []);

  // CONNECT BUTTON
  const handleConnectWithPatient = () => {
    if (!patientSocketId) {
      alert("Patient is not connected");
      return;
    }

    // Next page pe navigate karo, patientSocketId state ke through pass karo
    navigate("/doctor-dashboard/video-call", {
      state: { patientSocketId },
    });
  };

  // ... baaki tumhara notifications, doctorStatus fetch, socket connect logic same rahega ...

  const fetchDoctorStatus = async () => {
    try {
      const res = await getDoctorStatus();
      setDoctorStatus(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorStatus();
  }, []);

  const user = useSelector((state) => state.auth.user);
  const doctorId = user?.doctorId;

  useEffect(() => {
    if (!doctorId) return;
    socket.connect();
    socket.emit("joinDoctor", doctorId);
    return () => socket.disconnect();
  }, [doctorId]);

  useEffect(() => {
    const handleNewAppointment = (data) => {
      dispatch(
        addNotification({
          id: data.appointmentId,
          message: data.message,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          date: data.date,
          type: "NEW_APPOINTMENT",
          createdAt: new Date().toISOString(),
        })
      );
    };

    socket.on("new-appointment", handleNewAppointment);
    return () => socket.off("new-appointment", handleNewAppointment);
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      

      <div>
        {doctorStatus?.profileCompleted ? (
          <DoctorHome />
        ) : (
          <AccessFeatures
            doctorStatus={doctorStatus}
            refreshDoctorStatus={fetchDoctorStatus}
          />
        )}
      </div>
      <button
        onClick={handleConnectWithPatient}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Connect with Patient
      </button>
    </>
  );
};

export default DoctorDashboard;
