import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentApi } from '../../api/appointmentApi';
import { AppointmentCard } from '../../components/patient/AppointmentCard';
import { useDispatch } from 'react-redux';
import { setCallActive } from '../../redux/slices/queueSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { Calendar, CalendarCheck, CalendarX, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyAppointmentsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.getMyAppointments(),
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate >= today && appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED';
  });

  const pastAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate < today || appt.status === 'COMPLETED' || appt.status === 'CANCELLED';
  });

  const currentList = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const handleJoinCall = () => {
    dispatch(setCallActive(true));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            {t.myAppointments}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your consultations, offline queue tokens, and teleconsultations
          </p>
        </div>

        <button
          onClick={() => navigate('/patient-dashboard/hospitals')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-bold self-start sm:self-center shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.bookAppointment}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1.5 border border-white/10 max-w-md">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t.upcoming} ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          <span>{t.past} ({pastAppointments.length})</span>
        </button>
      </div>

      {/* Appointment List */}
      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="medical-card p-6 h-36 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
            <Calendar className="w-14 h-14 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">
              {activeTab === 'upcoming' ? 'No Upcoming Consultations' : 'No Past History Found'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? 'Book your next consultation with our top verified specialists.'
                : 'Your previous consultation records and history will show up here.'}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => navigate('/patient-dashboard/hospitals')}
                className="mt-4 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold cursor-pointer"
              >
                Find Doctors Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isPast={activeTab === 'past'}
                onJoinCall={handleJoinCall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsScreen;
