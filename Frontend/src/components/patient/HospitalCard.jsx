import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRight, ShieldCheck, Navigation } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const HospitalCard = ({ hospital, onDirections }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fallbackImage = '/assets/hospitals.jpg';

  return (
    <div
      onClick={() => navigate(`/patient-dashboard/hospitals/${hospital.id || hospital._id}`)}
      className="medical-card medical-card-interactive p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
    >
      <div className="flex items-start sm:items-center gap-4">
        {/* Hospital Thumbnail */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
          <img
            src={hospital.coverImage || fallbackImage}
            alt={hospital.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
          {hospital.isActive && (
            <span className="absolute top-2 left-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
        </div>

        {/* Hospital Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors truncate">
              {hospital.name}
            </h4>
            {hospital.rating && (
              <span className="flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {typeof hospital.rating === 'number' ? hospital.rating.toFixed(1) : hospital.rating}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{hospital.address}, {hospital.city}</span>
          </p>

          <div className="flex items-center gap-3 mt-3 flex-wrap text-xs">
            <span className="text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              {hospital.distanceKm !== undefined ? `${hospital.distanceKm.toFixed(1)} ${t.kmAway}` : `2.5 ${t.kmAway}`}
            </span>
            <span className={`font-semibold flex items-center gap-1 ${hospital.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {hospital.isActive ? t.availableNow : t.currentlyUnavailable}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onDirections && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirections(hospital);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Route</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patient-dashboard/hospitals/${hospital.id || hospital._id}`);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all active:scale-95"
        >
          <span>{t.viewDetails}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default HospitalCard;
