import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIncomingCall, setCallActive } from '../../redux/slices/queueSlice';
import { PhoneCall, PhoneOff, Video } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const incomingCall = useSelector((state) => state.queue?.incomingCall);

  if (!incomingCall) return null;

  const handleAccept = () => {
    dispatch(setCallActive(true));
  };

  const handleReject = () => {
    dispatch(setIncomingCall(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#161D2B] to-[#0C111A] border-2 border-blue-500/40 p-6 text-center shadow-2xl shadow-blue-500/30 animate-scaleUp">
        {/* Pulsing Call Avatar */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600/20 border-2 border-blue-500/50 mb-4">
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/30"></div>
          <Video className="h-10 w-10 text-blue-400 relative z-10 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          {t.incomingCall}
        </h3>
        <p className="text-xs text-blue-400 mt-1">
          {incomingCall.callerName || 'Attending Doctor'} is ready for your consultation
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-lg shadow-rose-600/20 active:scale-95">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-rose-300">{t.rejectCall}</span>
          </button>

          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white group-hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/40 active:scale-95">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-300">{t.acceptCall}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
