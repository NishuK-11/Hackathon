import React from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Clock, Video, Ticket, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const AppointmentCard = ({
  appointment,
  isPast,
  onJoinCall,
}) => {
  const { t } = useTranslation();
  const fallbackImage = '/assets/doctor.png';

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

      {/* Date, Time & Call Actions */}
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

        {/* Online Video Call Button */}
        {appointment.appointmentType === 'online' && !isPast && onJoinCall && (
          <button
            onClick={() => onJoinCall(appointment)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>{t.joinVideoCall}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
