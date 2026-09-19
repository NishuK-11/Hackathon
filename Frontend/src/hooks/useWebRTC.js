import { useState, useRef, useEffect, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

export const useWebRTC = (socket, callerSocketId, remoteOffer) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const startCall = useCallback(async () => {
    try {
      setConnectionStatus('Accessing camera & microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket && callerSocketId) {
          socket.emit('ice-candidate', {
            targetSocketId: callerSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setConnectionStatus(pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
        }
      };

      if (remoteOffer) {
        setConnectionStatus('Connecting to doctor...');
        await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (socket && callerSocketId) {
          socket.emit('answer-call', {
            targetSocketId: callerSocketId,
            answer,
          });
        }
      } else {
        setConnectionStatus('Consultation Active (Secure Link)');
        setIsConnected(true);
      }
    } catch (err) {
      console.error('❌ [WebRTC Error]:', err);
      setConnectionStatus('Camera access denied or unavailable');
    }
  }, [socket, callerSocketId, remoteOffer]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoDisabled((prev) => !prev);
    }
  }, [localStream]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setConnectionStatus('Call Ended');
  }, [localStream]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoDisabled,
    isConnected,
    connectionStatus,
    startCall,
    toggleAudio,
    toggleVideo,
    endCall,
  };
};

export default useWebRTC;
