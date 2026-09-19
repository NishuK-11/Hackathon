import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pharmacyApi } from '../../api/pharmacyApi';
import { useTranslation } from '../../hooks/useTranslation';
import { Pill, MapPin, Phone, ArrowRight, Search, Clock, ShieldCheck } from 'lucide-react';

export const PharmacyListScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: () => pharmacyApi.getAvailablePharmacies(),
  });

  const filteredPharmacies = pharmacies.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.shopName && p.shopName.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          {t.pharmacy || 'Pharmacies'} Network & Medicines
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore nearby verified partner pharmacies with live medicine stock availability
        </p>
      </div>

      {/* Search Bar */}
      <div className="medical-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pharmacies by shop name, road, or locality..."
            className="w-full rounded-xl bg-slate-900/90 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Pharmacy List */}
      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="medical-card p-6 h-32 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
            <Pill className="w-14 h-14 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Pharmacies Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria to find available chemist stores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                onClick={() => navigate(`/patient-dashboard/pharmacy/${pharmacy.id}/medicines`)}
                className="medical-card medical-card-interactive p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                    <Pill className="w-7 h-7" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {pharmacy.shopName}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{pharmacy.address}, {pharmacy.city}</span>
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {pharmacy.phone}
                      </span>
                      {pharmacy.openingHours && (
                        <span className="flex items-center gap-1 text-teal-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {pharmacy.openingHours}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient-dashboard/pharmacy/${pharmacy.id}/medicines`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-bold self-end sm:self-center shrink-0 shadow-md active:scale-95"
                >
                  <span>Browse Medicines</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyListScreen;
