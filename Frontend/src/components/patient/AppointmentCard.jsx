import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Clock, Video, Ticket, CheckCircle, AlertCircle, PlayCircle, FileText, X, Pill, Stethoscope, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { appointmentApi } from '../../api/appointmentApi';
import { toast } from 'react-toastify';

export const AppointmentCard = ({
  appointment,
  isPast,
  onJoinCall,
}) => {
  const { t } = useTranslation();
  const fallbackImage = '/assets/doctor.png';
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  const handleFetchPrescription = async () => {
    try {
      setLoadingPrescription(true);
      const apptId = appointment.id || appointment._id;
      const res = await appointmentApi.getPrescriptionForAppointment(apptId);
      if (res && (res.prescription || res._id)) {
        setPrescriptionData(res.prescription || res);
        setShowPrescriptionModal(true);
      } else {
        toast.info("Prescription is not yet uploaded by the doctor for this appointment.");
      }
    } catch (err) {
      toast.info("No prescription found for this appointment.");
    } finally {
      setLoadingPrescription(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
      case 'CURRENT':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400 animate-pulse',
          icon: <PlayCircle className="w-3.5 h-3.5" />
        };
      case 'COMPLETED':
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case 'SKIPPED':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      default:
        return {
          bg: 'bg-slate-700/30 border-slate-600 text-slate-300',
          icon: null
        };
    }
  };

  const statusBadge = getStatusBadge(appointment.status);

  let formattedDate = 'Upcoming';
  let formattedTime = '10:30 AM';
  try {
    const parsed = parseISO(appointment.date);
    formattedDate = format(parsed, 'dd MMM yyyy');
    formattedTime = format(parsed, 'hh:mm a');
  } catch {
    formattedDate = appointment.date;
  }

  return (
    <>
      <div className="medical-card p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Doctor & Clinic Info */}
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-800">
              <img
                src={appointment.doctorProfilePhoto || fallbackImage}
                alt={appointment.doctorName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-white tracking-tight">
                  {appointment.doctorName}
                </h4>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                  {statusBadge.icon}
                  {appointment.status}
                </span>
              </div>

              <p className="text-xs text-blue-400 font-medium mt-0.5">
                {appointment.departmentName}
              </p>

              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{appointment.hospitalName}</span>
              </p>
            </div>
          </div>

          {/* Token and Type Chip */}
          <div className="flex items-center gap-2 sm:self-start self-start">
            {appointment.appointmentType === 'online' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                Online Consultation
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <Ticket className="w-3.5 h-3.5 text-blue-400" />
                {appointment.token ? `Token #${appointment.token}` : 'In-Person OPD'}
              </span>
            )}
          </div>
        </div>

        {/* Date, Time & Call/Prescription Actions */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Prescription for Completed Consultations */}
            {appointment.status === 'COMPLETED' && (
              <button
                onClick={handleFetchPrescription}
                disabled={loadingPrescription}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{loadingPrescription ? 'Loading...' : 'View Prescription'}</span>
              </button>
            )}

            {/* Online Video Call Button */}
            {appointment.appointmentType === 'online' && !isPast && onJoinCall && (
              <button
                onClick={() => onJoinCall(appointment)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>{t.joinVideoCall}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && prescriptionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Medical Prescription</h3>
                  <p className="text-xs text-slate-400">Dr. {appointment.doctorName} • {appointment.hospitalName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-5">
              {/* Complaints & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prescriptionData.complaints?.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Chief Complaints</span>
                    <ul className="text-sm text-slate-200 list-disc list-inside space-y-0.5">
                      {prescriptionData.complaints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {prescriptionData.diagnosis?.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5">
                    <span className="text-xs text-cyan-400 font-semibold block mb-1">Diagnosis</span>
                    <ul className="text-sm text-slate-200 list-disc list-inside space-y-0.5">
                      {prescriptionData.diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Medicines */}
              {prescriptionData.medicines?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-blue-400" /> Prescribed Medications
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-white/5">
                        <tr>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-slate-900/50">
                        {prescriptionData.medicines.map((m, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-3 font-semibold text-white">{m.name}</td>
                            <td className="p-3">{m.dosage || '-'}</td>
                            <td className="p-3">{m.frequency || '-'}</td>
                            <td className="p-3">{m.duration || '-'}</td>
                            <td className="p-3 text-cyan-300">{m.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tests */}
              {prescriptionData.tests?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5">
                  <span className="text-xs text-amber-400 font-semibold block mb-1">Recommended Diagnostic Tests</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prescriptionData.tests.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              {prescriptionData.advice && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Doctor's Advice & Guidelines</span>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{prescriptionData.advice}</p>
                </div>
              )}

              {/* Follow-up */}
              {prescriptionData.followUpDate && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Next Follow-up Date: <strong>{format(new Date(prescriptionData.followUpDate), 'dd MMM yyyy')}</strong></span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
