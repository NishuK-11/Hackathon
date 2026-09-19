import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCallActive } from '../../redux/slices/queueSlice';
import { useWebRTC } from '../../hooks/useWebRTC';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck } from 'lucide-react';

export const VideoCallModal = () => {
  const dispatch = useDispatch();
  const isCallActive = useSelector((state) => state.queue?.isCallActive);

  const {
    localVideoRef,
    remoteVideoRef,
    isAudioMuted,
    isVideoDisabled,
    connectionStatus,
    startCall,
    toggleAudio,
    toggleVideo,
    endCall,
  } = useWebRTC(null);

  useEffect(() => {
    if (isCallActive) {
      startCall();
    }
  }, [isCallActive, startCall]);

  if (!isCallActive) return null;

  const handleHangup = () => {
    endCall();
    dispatch(setCallActive(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-6 animate-fadeIn">
      <div className="relative flex flex-col h-full w-full max-w-5xl rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
        {/* Top Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 border border-white/10 text-xs font-semibold text-white pointer-events-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Consultation Session</span>
            <span className="text-slate-400">| {connectionStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 border border-blue-500/30 pointer-events-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
          <div className="relative h-full w-full flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {/* Fallback Doctor Frame */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center p-6 -z-0">
              <div className="h-28 w-28 rounded-full border-4 border-blue-500/30 overflow-hidden shadow-2xl mb-4 bg-slate-800 flex items-center justify-center">
                <img
                  src="/assets/doctor.png"
                  alt="Doctor"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&fit=crop';
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-white">Dr. Attending Specialist</h3>
              <p className="text-xs text-blue-400 mt-1">Direct Teleconsultation Channel</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>Connected over secure WebRTC peer</span>
              </div>
            </div>
          </div>

          {/* Local Patient Video (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 h-36 w-28 sm:h-48 sm:w-36 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-black shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transform -scale-x-100 ${isVideoDisabled ? 'hidden' : 'block'}`}
            />
            {isVideoDisabled && (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 text-[10px]">
                <VideoOff className="w-6 h-6 mb-1" />
                <span>Camera Off</span>
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
              You
            </span>
          </div>
        </div>

        {/* Bottom Floating Control Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 px-6 py-3 shadow-2xl">
          <button
            onClick={toggleAudio}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
              isVideoDisabled
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isVideoDisabled ? 'Enable Camera' : 'Disable Camera'}
          >
            {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleHangup}
            className="flex h-12 w-14 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/40 active:scale-95"
            title="End Consultation"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
