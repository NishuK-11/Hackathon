import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEmergencyModalOpen, showToast } from '../../redux/slices/uiSlice';
import { Modal } from './Modal';
import { emergencyApi } from '../../api/emergencyApi';
import { ShieldAlert, MapPin, PhoneCall, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const EmergencySosModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isOpen = useSelector((state) => state.ui?.isEmergencyModalOpen);

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [reason, setReason] = useState('Severe Chest Pain / Cardiac Emergency');
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      emergencyApi.getActiveEmergency().then(setActiveEmergency).catch(() => {});

      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setIsLocating(false);
          },
          () => {
            setCoords({ lat: 18.5204, lng: 73.8567 });
            setIsLocating(false);
          }
        );
      } else {
        setCoords({ lat: 18.5204, lng: 73.8567 });
        setIsLocating(false);
      }
    }
  }, [isOpen]);

  const handleTriggerSos = async () => {
    if (!coords) return;
    setIsSubmitting(true);
    try {
      const res = await emergencyApi.createEmergency(coords.lat, coords.lng, reason, message);
      setActiveEmergency(res);
      dispatch(showToast({ message: 'Emergency SOS activated! Nearby hospitals & ambulance alerted.', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to broadcast SOS', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEmergency = async () => {
    if (!activeEmergency?.id) return;
    try {
      await emergencyApi.cancelEmergency(activeEmergency.id);
      setActiveEmergency(null);
      dispatch(showToast({ message: 'Emergency SOS cancelled', type: 'info' }));
    } catch {
      dispatch(showToast({ message: 'Failed to cancel emergency', type: 'error' }));
    }
  };

  const emergencyReasons = [
    'Severe Chest Pain / Cardiac Emergency',
    'Accident / Severe Bleeding / Trauma',
    'Breathing Difficulty / Asthma Attack',
    'Stroke / Unconsciousness / Paralysis',
    'Severe High Fever / Convulsion',
    'Pregnancy / Labor Emergency'
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(setEmergencyModalOpen(false))} maxWidth="md">
      <div>
        {activeEmergency ? (
          <div className="text-center py-2">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500 mb-4">
              <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
              <ShieldAlert className="h-10 w-10 text-red-500 relative z-10 animate-bounce" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">
              AMBULANCE DISPATCHED
            </h3>
            <p className="text-xs text-red-400 mt-1 font-semibold">
              Emergency Services Are On Their Way To Your Coordinates
            </p>

            <div className="mt-5 rounded-2xl bg-slate-900 border border-white/10 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Reason:</span>
                <span className="text-white font-medium">{activeEmergency.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Location:</span>
                <span className="text-emerald-400 font-mono">
                  {activeEmergency.latitude?.toFixed(4) || '18.5204'}, {activeEmergency.longitude?.toFixed(4) || '73.8567'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Priority Alerted
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="tel:108"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call Emergency Helpline (108)</span>
              </a>

              <button
                onClick={handleCancelEmergency}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Cancel Emergency Call</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  One-Click Emergency SOS
                </h3>
                <p className="text-xs text-slate-400">
                  Broadcasts your instant location to the nearest hospitals and ambulances.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-slate-300 mb-4">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              {isLocating ? (
                <span>Locating your exact GPS position...</span>
              ) : coords ? (
                <span>GPS Locked: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
              ) : (
                <span>Unable to fetch exact GPS location</span>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Medical Emergency Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
              >
                {emergencyReasons.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Landmark or Critical Details (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="E.g., 2nd floor, flat 204, patient is unable to walk..."
                rows={2}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <button
              onClick={handleTriggerSos}
              disabled={isSubmitting || isLocating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-red-600/40 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>{isSubmitting ? 'BROADCASTING SOS...' : 'SEND EMERGENCY SOS NOW'}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmergencySosModal;
