import React from 'react';
import { Award, CalendarCheck, IndianRupee } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const DoctorCard = ({ doctor, onBook }) => {
  const { t } = useTranslation();
  const fallbackImage = '/assets/doctor.png';

  return (
    <div className="medical-card p-5 flex flex-col justify-between group hover:border-blue-500/30">
      <div>
        <div className="flex items-start gap-4">
          {/* Avatar with glow ring */}
          <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-800 shadow-md shadow-blue-500/10">
            <img
              src={doctor.profilePhoto || fallbackImage}
              alt={doctor.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
            {doctor.isAvailable && (
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-blue-400 transition-colors">
              {doctor.name}
            </h4>
            <p className="text-xs font-semibold text-blue-400 mt-0.5 truncate">
              {doctor.specialization}
            </p>
            {doctor.qualification && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {doctor.qualification}
              </p>
            )}
          </div>
        </div>

        {/* Badges / Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{doctor.experienceYears ? `${doctor.experienceYears} Yrs Exp` : '10+ Yrs Exp'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl">
            <IndianRupee className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-400">₹{doctor.consultationFee || 600} Fee</span>
          </div>
        </div>
      </div>

      {/* Booking Action */}
      <div className="mt-5">
        <button
          onClick={() => onBook(doctor)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl glow-btn-primary font-semibold text-xs tracking-wide shadow-md shadow-blue-500/20 active:scale-98"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t.bookAppointment}</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
