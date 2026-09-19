import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '../../api/hospitalApi';
import { HospitalCard } from '../../components/patient/HospitalCard';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, LocateFixed, Building2 } from 'lucide-react';

export const HospitalListScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [useNearby, setUseNearby] = useState(false);

  // States query
  const { data: states = ['All'] } = useQuery({
    queryKey: ['hospital-states'],
    queryFn: () => hospitalApi.getStates(),
  });

  // Cities query
  const { data: cities = ['All'] } = useQuery({
    queryKey: ['hospital-cities', selectedState],
    queryFn: () => hospitalApi.getCities(selectedState),
  });

  // Hospitals query
  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ['hospitals', selectedState, selectedCity, useNearby],
    queryFn: () =>
      hospitalApi.getHospitals({
        state: selectedState,
        city: selectedCity,
        lat: useNearby ? 18.5204 : undefined,
        lng: useNearby ? 73.8567 : undefined,
      }),
  });

  const filteredHospitals = hospitals.filter((h) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.city && h.city.toLowerCase().includes(q)) ||
      (h.address && h.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Hospitals & Health Centers
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore accredited multi-specialty hospitals with live queue systems
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="medical-card p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, area, or locality..."
            className="w-full rounded-xl bg-slate-900/90 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dropdowns & Geolocation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* State Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('All');
              }}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
            >
              {states.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Nearby Toggle Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setUseNearby(!useNearby)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all border cursor-pointer ${
                useNearby
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              <LocateFixed className="w-4 h-4 text-blue-400" />
              <span>{useNearby ? 'Hospitals Near Me (Active)' : 'Hospitals Near Me'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Results */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Found {filteredHospitals.length} hospitals</span>
          {(selectedState !== 'All' || selectedCity !== 'All' || useNearby) && (
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedCity('All');
                setUseNearby(false);
                setSearchQuery('');
              }}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="medical-card p-6 h-28 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Hospitals Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your state, city, or search terms to find available clinics.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id || hospital._id}
                hospital={hospital}
                onDirections={(h) => navigate(`/patient-dashboard/route/${h.id || h._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalListScreen;
