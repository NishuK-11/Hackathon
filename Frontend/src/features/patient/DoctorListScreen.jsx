import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '../../api/doctorApi';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { BookAppointmentModal } from '../../components/patient/BookAppointmentModal';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const DoctorListScreen = () => {
  const { hospitalId, departmentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors', hospitalId, departmentId],
    queryFn: () => doctorApi.getDoctors(hospitalId || '', departmentId || ''),
    enabled: Boolean(hospitalId && departmentId),
  });

  const handleBook = (doc) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    navigate('/patient-dashboard/appointments');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Available Specialists
          </h1>
          <p className="text-xs text-slate-400">
            Book appointments for online teleconsultation or in-person hospital OPD
          </p>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="medical-card p-6 h-52 animate-pulse bg-slate-900/50" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Doctors Listed</h4>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no active doctors scheduled for this department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id || doctor._id}
              doctor={doctor}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default DoctorListScreen;
