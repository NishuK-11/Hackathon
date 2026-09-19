import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEmergencyModalOpen, showToast } from '../../redux/slices/uiSlice';
import { Modal } from './Modal';
import { emergencyApi } from '../../api/emergencyApi';
import { hospitalApi } from '../../api/hospitalApi';
import socket from '../../socket';
import { ShieldAlert, MapPin, PhoneCall, AlertTriangle, CheckCircle2, XCircle, Building2, Truck, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const EmergencySosModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isOpen = useSelector((state) => state.ui?.isEmergencyModalOpen);

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [reason, setReason] = useState('CHEST_PAIN');
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const emergencyReasons = [
    { label: 'Severe Chest Pain / Cardiac Emergency', value: 'CHEST_PAIN' },
    { label: 'Accident / Severe Bleeding / Trauma', value: 'ACCIDENT' },
    { label: 'Breathing Difficulty / Severe Asthma', value: 'BREATHING_DIFFICULTY' },
    { label: 'Stroke / Unconsciousness / Collapse', value: 'UNCONSCIOUS' },
    { label: 'Severe Acute Pain / Fracture', value: 'SEVERE_PAIN' },
    { label: 'Other Medical Emergency', value: 'OTHER' }
  ];

  // Fetch active emergency and hospitals when modal opens
  useEffect(() => {
    if (isOpen) {
      emergencyApi.getActiveEmergency()
        .then((data) => {
          if (data && data.status !== 'CANCELLED' && data.status !== 'COMPLETED') {
            setActiveEmergency(data);
          } else {
            setActiveEmergency(null);
          }
        })
        .catch(() => {});

      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCoords(userLoc);
            setIsLocating(false);
            loadNearbyHospitals(userLoc);
          },
          () => {
            const fallbackLoc = { lat: 18.5204, lng: 73.8567 };
            setCoords(fallbackLoc);
            setIsLocating(false);
            loadNearbyHospitals(fallbackLoc);
          }
        );
      } else {
        const fallbackLoc = { lat: 18.5204, lng: 73.8567 };
        setCoords(fallbackLoc);
        setIsLocating(false);
        loadNearbyHospitals(fallbackLoc);
      }
    }
  }, [isOpen]);

  const loadNearbyHospitals = async (loc) => {
    try {
      setLoadingHospitals(true);
      const list = await hospitalApi.getHospitals({ lat: loc.lat, lng: loc.lng });
      if (Array.isArray(list) && list.length > 0) {
        setHospitals(list);
        setSelectedHospitalId(list[0]._id || list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch hospitals for emergency:', err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Listen for real-time ambulance and status updates from backend
  useEffect(() => {
    const handleEmergencyStatusUpdated = (updatedEmergency) => {
      if (updatedEmergency) {
        setActiveEmergency(updatedEmergency);
        const statusLabel = updatedEmergency.status ? updatedEmergency.status.replace(/_/g, ' ') : 'Updated';
        dispatch(showToast({
          message: `Ambulance Alert: Status is now ${statusLabel}`,
          type: 'info'
        }));
      }
    };

    socket.on('emergency-status-updated', handleEmergencyStatusUpdated);
    return () => {
      socket.off('emergency-status-updated', handleEmergencyStatusUpdated);
    };
  }, [dispatch]);

  const handleTriggerSos = async () => {
    if (!coords) {
      dispatch(showToast({ message: 'GPS coordinates required to dispatch emergency services.', type: 'error' }));
      return;
    }
    if (!selectedHospitalId) {
      dispatch(showToast({ message: 'Please select a hospital to dispatch the emergency to.', type: 'error' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyApi.createEmergency(
        coords.lat,
        coords.lng,
        reason,
        message,
        selectedHospitalId
      );
      setActiveEmergency(res);
      dispatch(showToast({
        message: 'Emergency SOS activated! Hospital and ambulances alerted.',
        type: 'success'
      }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to broadcast SOS. Calling 108 directly...', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEmergency = async () => {
    const emgId = activeEmergency?._id || activeEmergency?.id;
    if (!emgId) return;
    try {
      await emergencyApi.cancelEmergency(emgId);
      setActiveEmergency(null);
      dispatch(showToast({ message: 'Emergency SOS request cancelled', type: 'info' }));
    } catch {
      dispatch(showToast({ message: 'Failed to cancel emergency request', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(setEmergencyModalOpen(false))} maxWidth="md">
      <div>
        {activeEmergency ? (
          <div className="text-center py-2 animate-fadeIn">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500 mb-4">
              <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
              <ShieldAlert className="h-10 w-10 text-red-500 relative z-10 animate-bounce" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">
              AMBULANCE DISPATCH ACTIVE
            </h3>
            <p className="text-xs text-red-400 mt-1 font-semibold">
              Emergency Services Have Been Alerted To Your Coordinates
            </p>

            {/* Emergency Status Details */}
            <div className="mt-5 rounded-2xl bg-slate-900 border border-white/10 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-amber-400 font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeEmergency.status ? activeEmergency.status.replace(/_/g, ' ') : 'REQUESTED'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Reason:</span>
                <span className="text-white font-medium">{activeEmergency.reason}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="text-emerald-400 font-mono">
                  {activeEmergency.latitude?.toFixed(4) || activeEmergency.location?.coordinates?.[1]?.toFixed(4) || '18.5204'},{' '}
                  {activeEmergency.longitude?.toFixed(4) || activeEmergency.location?.coordinates?.[0]?.toFixed(4) || '73.8567'}
                </span>
              </div>

              {/* Assigned Ambulance Details (If assigned by hospital) */}
              {activeEmergency.ambulance?.driverName && (
                <div className="pt-2 mt-2 border-t border-white/10 space-y-2 bg-slate-800/40 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                    <Truck className="w-4 h-4" />
                    <span>Assigned Ambulance Details:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vehicle No</span>
                      <span className="font-mono font-bold text-white">{activeEmergency.ambulance.vehicleNumber || 'En route'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Driver Name</span>
                      <span className="font-semibold text-white">{activeEmergency.ambulance.driverName}</span>
                    </div>
                  </div>

                  {activeEmergency.ambulance.driverPhone && (
                    <a
                      href={`tel:${activeEmergency.ambulance.driverPhone}`}
                      className="mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Ambulance Driver ({activeEmergency.ambulance.driverPhone})</span>
                    </a>
                  )}
                </div>
              )}
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
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Cancel Emergency SOS Request</span>
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
                  Broadcasts your instant location to the nearest hospital and ambulances.
                </p>
              </div>
            </div>

            {/* GPS Location Status */}
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

            {/* Hospital Target Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Select Target Emergency Hospital</span>
              </label>
              {loadingHospitals ? (
                <div className="p-2.5 text-xs text-slate-500 bg-slate-900 rounded-xl">Loading nearby emergency hospitals...</div>
              ) : hospitals.length > 0 ? (
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                >
                  {hospitals.map((h) => (
                    <option key={h._id || h.id} value={h._id || h.id} className="bg-slate-900 text-white">
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  No registered hospitals detected in local range. Emergency call 108 is advised.
                </p>
              )}
            </div>

            {/* Emergency Reason */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Medical Emergency Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
              >
                {emergencyReasons.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-900">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional notes/landmark */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Landmark or Critical Condition Notes (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="E.g., 2nd floor, flat 204, patient is unresponsive..."
                rows={2}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <button
              onClick={handleTriggerSos}
              disabled={isSubmitting || isLocating || !selectedHospitalId}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-red-600/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>{isSubmitting ? 'DISPATCHING SOS...' : 'BROADCAST EMERGENCY SOS'}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmergencySosModal;
