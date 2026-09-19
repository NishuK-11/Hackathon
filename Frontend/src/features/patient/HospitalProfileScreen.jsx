import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '../../api/hospitalApi';
import { doctorApi } from '../../api/doctorApi';
import { HospitalReviews } from './HospitalReviews';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Navigation, 
  Building2, 
  Heart, 
  Bone, 
  Brain, 
  Baby, 
  Sparkles, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export const HospitalProfileScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const { data: hospital, isLoading: isHospitalLoading } = useQuery({
    queryKey: ['hospital-profile', id],
    queryFn: () => hospitalApi.getHospitalProfile(id || ''),
    enabled: Boolean(id),
  });

  const { data: departments = [], isLoading: isDeptLoading } = useQuery({
    queryKey: ['departments', id],
    queryFn: () => doctorApi.getDepartments(id || ''),
    enabled: Boolean(id),
  });

  if (isHospitalLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-slate-900" />
        <div className="h-40 rounded-3xl bg-slate-900" />
        <div className="h-60 rounded-3xl bg-slate-900" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <Building2 className="w-16 h-16 text-slate-600 mb-3" />
        <h3 className="text-xl font-bold text-white">Hospital Not Found</h3>
        <button
          onClick={() => navigate('/patient-dashboard/hospitals')}
          className="mt-4 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold cursor-pointer"
        >
          Back to Hospitals
        </button>
      </div>
    );
  }

  const getDeptIcon = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('cardio')) return <Heart className="w-5 h-5 text-rose-400" />;
    if (lower.includes('ortho')) return <Bone className="w-5 h-5 text-amber-400" />;
    if (lower.includes('neuro')) return <Brain className="w-5 h-5 text-purple-400" />;
    if (lower.includes('pedia')) return <Baby className="w-5 h-5 text-teal-400" />;
    if (lower.includes('derma')) return <Sparkles className="w-5 h-5 text-pink-400" />;
    return <Stethoscope className="w-5 h-5 text-blue-400" />;
  };

  const fallbackCover = '/assets/hospitals.jpg';
  const fallbackLogo = '/assets/image.png';

  return (
    <div className="pb-24 animate-fadeIn">
      {/* Hero Cover Image Section */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
        <img
          src={hospital.coverImage || fallbackCover}
          alt={hospital.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = fallbackCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-black/40 to-black/60" />

        {/* Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        {/* Floating Hospital Card */}
        <div className="medical-card p-6 shadow-2xl border-white/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo */}
            <div className="h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-800 shadow-xl shadow-blue-500/10">
              <img
                src={hospital.logo || fallbackLogo}
                alt={hospital.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackLogo;
                }}
              />
            </div>

            {/* Title & Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {hospital.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  hospital.isActive
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-700/40 border border-slate-600 text-slate-400'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${hospital.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {hospital.isActive ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <p className="text-xs font-medium text-slate-400 mt-1">
                Multi Speciality Healthcare Center & Emergency Services
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <MapPin className="w-4 h-4" />
                  {hospital.city}, {hospital.state}
                </span>
                {hospital.distanceKm && (
                  <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                    {hospital.distanceKm.toFixed(1)} km away
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            <a
              href={`tel:${hospital.phoneNumber}`}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/5 transition-colors group"
            >
              <Phone className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Call Clinic</span>
            </a>

            <button
              onClick={() => navigate(`/patient-dashboard/route/${hospital.id || hospital._id}`)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/5 transition-colors group cursor-pointer"
            >
              <Navigation className="w-5 h-5 text-teal-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Directions</span>
            </button>

            <a
              href={`mailto:${hospital.email}`}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/5 transition-colors group"
            >
              <Mail className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Email</span>
            </a>
          </div>
        </div>

        {/* Address & Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="medical-card p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Full Address</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
            </p>
          </div>

          <div className="medical-card p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </h4>
            <p className="text-xs text-slate-300">
              Helpline: {hospital.phoneNumber} <br />
              Email: {hospital.email}
            </p>
          </div>
        </div>

        {/* About Hospital */}
        {hospital.description && (
          <div className="medical-card p-6 space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              About {hospital.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {hospital.description}
            </p>

            {hospital.facilities && hospital.facilities.length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Available Facilities:</span>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Departments Grid */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Clinical Departments
            </h3>
            <p className="text-xs text-slate-400">
              Select a specialty to consult our top doctors and book appointments
            </p>
          </div>

          {isDeptLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="medical-card p-4 h-20 animate-pulse bg-slate-900/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {departments.map((dept) => (
                <button
                  key={dept.id || dept._id}
                  onClick={() => navigate(`/patient-dashboard/doctors/${hospital.id || hospital._id}/${dept.id || dept._id}`)}
                  className="medical-card medical-card-interactive p-4 flex items-center justify-between group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 group-hover:scale-110 transition-transform">
                      {getDeptIcon(dept.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {dept.name}
                      </h4>
                      <span className="text-xs text-blue-400 font-semibold">
                        {dept.doctorCount || 3} Doctors
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hospital Gallery */}
        {hospital.galleryImages && hospital.galleryImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Hospital Facility Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {hospital.galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveGalleryIndex(idx)}
                  className="h-28 sm:h-36 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer group"
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Reviews Section */}
        <div className="pt-4">
          <HospitalReviews hospitalId={hospital.id || hospital._id} />
        </div>
      </div>
    </div>
  );
};

export default HospitalProfileScreen;
