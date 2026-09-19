import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { setEmergencyModalOpen } from '../../redux/slices/uiSlice';
import { hospitalApi } from '../../api/hospitalApi';
import { HospitalCard } from '../../components/patient/HospitalCard';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Building2, 
  Stethoscope, 
  ShieldAlert, 
  Pill, 
  ArrowRight, 
  Clock, 
  Users, 
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
  const queue = useSelector((state) => state.queue?.queue);

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ['hospitals', 'nearby'],
    queryFn: () => hospitalApi.getHospitals(),
  });

  const quickAccessItems = [
    {
      title: t.findHospitals,
      subtitle: 'Verified clinics & centers',
      icon: Building2,
      color: 'from-blue-600 to-indigo-600',
      action: () => navigate('/patient/hospitals'),
    },
    {
      title: t.topDoctors,
      subtitle: 'Specialists & surgeons',
      icon: Stethoscope,
      color: 'from-teal-600 to-emerald-600',
      action: () => navigate('/patient/hospitals'),
    },
    {
      title: 'Emergency SOS',
      subtitle: 'Instant GPS broadcast',
      icon: ShieldAlert,
      color: 'from-rose-600 to-red-600',
      action: () => dispatch(setEmergencyModalOpen(true)),
      pulse: true,
    },
    {
      title: t.pharmacy,
      subtitle: 'Medicines & refills',
      icon: Pill,
      color: 'from-amber-600 to-orange-600',
      action: () => navigate('/patient/pharmacy'),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8 animate-fadeIn">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.welcomeBack}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{user?.name || 'Patient'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-medium text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            MediReach Live Health Network
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900 via-[#0B132B] to-[#05070D] p-6 sm:p-10 shadow-2xl shadow-blue-500/10">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: `url('/assets/home.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070D] via-[#05070D]/80 to-transparent" />

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 px-3 py-1 text-xs font-bold text-blue-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Smart OPD & Teleconsultation
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.skipTheWait} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400">
              {t.bookWithEase}
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
            {t.bookAppointmentsQueue}. Track doctor consultation status from home and join video calls instantly.
          </p>

          

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/patient/hospitals')}
              className="flex items-center gap-2 rounded-xl glow-btn-primary px-5 py-2.5 text-xs font-bold tracking-wide shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              <span>{t.bookAppointment}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/patient/queue')}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-white/10 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>View OPD Queue</span>
            </button>
          </div>
          
        </div>
         
      </div>

      <button
        onClick={() => navigate('/patient-dashboard/ai-chat')}
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-indigo-600/20 px-5 py-4 text-left shadow-lg shadow-cyan-500/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/20 active:scale-[0.98]"
      >
        {/* Glow */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl transition-all duration-300 group-hover:bg-cyan-400/30" />

        {/* Icon */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/30">
          <Sparkles className="h-6 w-6 text-white" />
        </div>

        {/* Text */}
        <div className="relative">
          <p className="text-sm font-extrabold text-white">
            Your AI Assistant
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Talk to MediReach AI about your health
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className="relative ml-auto h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      {/* Active Live Queue Status Banner */}
      {queue?.hasActiveQueue && (
        <div 
          onClick={() => navigate('/patient/queue')}
          className="medical-card medical-card-interactive p-5 border-blue-500/40 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Active OPD Queue Tracker
                </h4>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  {queue.doctorName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Serving Token <span className="font-extrabold text-blue-400">#{queue.currentToken || 0}</span> • Your Token is <span className="font-extrabold text-emerald-400">#{queue.yourToken || 0}</span> ({queue.patientsAhead || 0} patients ahead)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open Queue Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Quick Access Section */}
      <section>
        <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <span>{t.quickAccess}</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickAccessItems.map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className="medical-card medical-card-interactive p-4 sm:p-5 flex flex-col items-start text-left group cursor-pointer"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg shadow-black/40 text-white mb-3 group-hover:scale-110 transition-transform ${item.pulse ? 'animate-pulse' : ''}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {item.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Nearby Hospitals Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.nearbyHospitals}
            </h3>
            <p className="text-xs text-slate-400">Healthcare centers around your vicinity</p>
          </div>
          <button
            onClick={() => navigate('/patient/hospitals')}
            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="medical-card p-5 h-28 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            {t.noHospitalsFoundNearby}
          </div>
        ) : (
          <div className="space-y-3">
            {hospitals.slice(0, 3).map((hospital) => (
              <HospitalCard
                key={hospital.id || hospital._id}
                hospital={hospital}
                onDirections={(h) => navigate(`/patient/route/${h.id || h._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;
