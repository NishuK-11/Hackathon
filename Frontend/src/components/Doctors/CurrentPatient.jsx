import { User, Clock3, PhoneCall, SkipForward, CheckCircle2, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ⭐ redux se completeAppointment import hata diya — parent (onComplete prop) API call handle karega

const CurrentPatient = ({ appointment, onComplete, onSkip, onCallNext }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!appointment) {
    return (
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center text-gray-400">
        No patient is currently in queue.
      </div>
    );
  }

  const patient = appointment.patient?.userId;

  const runAction = async (fn) => {
    try {
      setLoading(true);
      await fn();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl">
      <div className="absolute inset-0 animate-pulse bg-emerald-500/5 pointer-events-none" />
      <div className="relative p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400"></span>
            </span>
            <span className="font-semibold uppercase tracking-widest text-emerald-400">
              Live OPD Consultation
            </span>
          </div>
          <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-bold text-blue-400">
            Token #{appointment.token}
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-400/40 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <User size={48} className="text-white" />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-white">{patient?.name || "Unknown"}</h2>
          <p className="mt-1 text-gray-400">{patient?.email || ""}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-800 p-4">
            <p className="text-xs uppercase text-gray-400">Appointment Time</p>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Clock3 size={18} />
              {appointment.consultationStartedAt
                ? new Date(appointment.consultationStartedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-800 p-4">
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">Consultation Running</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => runAction(() => onComplete(appointment._id))}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 size={18} /> Complete Appointment
          </button>

          <button  onClick={() => navigate(`/doctor-dashboard/patients/${appointment.patient._id}`)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 font-semibold text-white transition hover:bg-slate-700">
            <Eye size={18} /> See Profile
          </button>

          <button
            onClick={() =>
              navigate(
                `/doctor-dashboard/patients/${appointment.patient._id}/prescription?appointmentId=${appointment._id}`
              )
            }
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            <SkipForward size={18} /> Add Prescription
          </button>

          <button
            onClick={() => runAction(onCallNext)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <PhoneCall size={18} /> Call Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentPatient;