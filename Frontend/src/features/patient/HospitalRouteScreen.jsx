import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '../../api/hospitalApi';
import { HospitalRouteMap } from '../../components/patient/HospitalRouteMap';
import { ArrowLeft, MapPin, Phone, ExternalLink } from 'lucide-react';

export const HospitalRouteScreen = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const [patientCoords, setPatientCoords] = useState([18.5204, 73.8567]);
  const [routeCoords, setRouteCoords] = useState([]);

  const { data: hospital } = useQuery({
    queryKey: ['hospital-profile', hospitalId],
    queryFn: () => hospitalApi.getHospitalProfile(hospitalId || ''),
    enabled: Boolean(hospitalId),
  });

  const hospitalCoords = (hospital?.location?.coordinates && hospital.location.coordinates.length === 2)
    ? [hospital.location.coordinates[1], hospital.location.coordinates[0]]
    : [18.5314, 73.8298];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const pt = [pos.coords.latitude, pos.coords.longitude];
          setPatientCoords(pt);
          hospitalApi.getRouteToHospital(pt[0], pt[1], hospitalId || '').then(setRouteCoords);
        },
        () => {
          hospitalApi.getRouteToHospital(patientCoords[0], patientCoords[1], hospitalId || '').then(setRouteCoords);
        }
      );
    } else {
      hospitalApi.getRouteToHospital(patientCoords[0], patientCoords[1], hospitalId || '').then(setRouteCoords);
    }
  }, [hospitalId]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Navigation to Hospital
          </h1>
          <p className="text-xs text-slate-400">
            {hospital?.name || 'Hospital'} • GeoJSON Route
          </p>
        </div>
      </div>

      {/* Map */}
      <HospitalRouteMap
        patientLocation={patientCoords}
        hospitalLocation={hospitalCoords}
        hospitalName={hospital?.name || 'Hospital Location'}
        routeCoordinates={routeCoords.length > 0 ? routeCoords : undefined}
      />

      {/* Route & Hospital Info Card */}
      {hospital && (
        <div className="medical-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">{hospital.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{hospital.address}, {hospital.city}</span>
              </p>
            </div>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
              ~15 mins travel
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                (hospital.name || '') + ' ' + (hospital.city || '')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl glow-btn-primary font-semibold text-xs shadow-md active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>

            {hospital.phoneNumber && (
              <a
                href={`tel:${hospital.phoneNumber}`}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Call Hospital</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRouteScreen;
