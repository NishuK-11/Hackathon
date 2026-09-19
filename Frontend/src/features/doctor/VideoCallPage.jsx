import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../socket";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Previous page se patientSocketId aayega navigation state ke through
  const { patientSocketId } = location.state || {};

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("Connecting...");

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const statsIntervalRef = useRef(null);
  const pendingIceCandidates = useRef([]);
  const localStreamRef = useRef(null);

  // =========================================================
  // START CAMERA
  // =========================================================
  const startCamera = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    setLocalStream(stream);

    console.log("🎥 Camera + microphone started");

    return stream;
  };

  // =========================================================
  // CLEANUP
  // =========================================================
  const cleanupPeerConnection = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    pendingIceCandidates.current = [];

    if (peerConnection.current) {
      peerConnection.current.onicecandidate = null;
      peerConnection.current.ontrack = null;
      peerConnection.current.onconnectionstatechange = null;
      peerConnection.current.oniceconnectionstatechange = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
  };

  // =========================================================
  // CALL PATIENT
  // =========================================================
  const callPatient = async (stream) => {
    try {
      if (!patientSocketId) {
        setStatus("Patient not connected");
        return;
      }

      cleanupPeerConnection();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });

      peerConnection.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            targetSocketId: patientSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("🔗 CONNECTION STATE:", pc.connectionState);

        if (pc.connectionState === "connected") {
          setStatus("Connected");
        }

        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          setStatus("Call ended");
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE CONNECTION STATE:", pc.iceConnectionState);
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", {
        targetSocketId: patientSocketId,
        offer: {
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
        },
      });

      console.log("📞 Call sent to patient");
    } catch (error) {
      console.error("❌ Call failed:", error);
      setStatus("Call failed");
    }
  };

  // =========================================================
  // AUTO START ON MOUNT — yahi wo cheez hai jo tum chahte ho
  // =========================================================
  useEffect(() => {
    const startEverything = async () => {
      try {
        const stream = await startCamera();
        await callPatient(stream);
      } catch (error) {
        console.error("❌ Auto-start failed:", error);
        setStatus("Failed to start call");
      }
    };

    startEverything();

    // Cleanup on unmount (page se hatne pe)
    return () => {
      cleanupPeerConnection();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // =========================================================
  // RECEIVE CALL ANSWER
  // =========================================================
  useEffect(() => {
    const handleCallAccepted = async (data) => {
      try {
        const pc = peerConnection.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

        for (const candidate of pendingIceCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        pendingIceCandidates.current = [];
      } catch (error) {
        console.error("❌ Error setting remote answer:", error);
      }
    };

    socket.on("call-accepted", handleCallAccepted);

    return () => socket.off("call-accepted", handleCallAccepted);
  }, []);

  // =========================================================
  // RECEIVE ICE CANDIDATES
  // =========================================================
  useEffect(() => {
    const handleIceCandidate = async (data) => {
      try {
        const pc = peerConnection.current;
        if (!pc || !data.candidate) return;

        if (!pc.remoteDescription) {
          pendingIceCandidates.current.push(data.candidate);
          return;
        }

        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
      }
    };

    socket.on("ice-candidate", handleIceCandidate);

    return () => socket.off("ice-candidate", handleIceCandidate);
  }, []);

  // =========================================================
  // ATTACH VIDEOS
  // =========================================================
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current
        .play()
        .catch((err) => console.error("❌ Remote play failed:", err));
    }
  }, [remoteStream]);

  // =========================================================
  // END CALL
  // =========================================================
  const endCall = () => {
    cleanupPeerConnection();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    navigate(-1); // pichle page pe wapas
  };

  return (
    <div className="relative h-screen w-screen bg-black">

      {/* REMOTE VIDEO — full screen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {!remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-lg">{status}</p>
        </div>
      )}

      {/* LOCAL VIDEO — small corner */}
      {localStream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-5 right-5 w-32 rounded-lg border border-white/30"
        />
      )}

      {/* END CALL BUTTON */}
      <button
        onClick={endCall}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-red-600 text-white font-medium"
      >
        End Call
      </button>

    </div>
  );
};

export default VideoCallPage;