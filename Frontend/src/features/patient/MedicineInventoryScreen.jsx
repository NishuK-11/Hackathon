import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pharmacyApi } from '../../api/pharmacyApi';
import { MedicineCard } from '../../components/patient/MedicineCard';
import { ArrowLeft, Search, Pill } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const MedicineInventoryScreen = () => {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', pharmacyId],
    queryFn: () => pharmacyApi.getMedicinesByPharmacy(pharmacyId || ''),
    enabled: Boolean(pharmacyId),
  });

  const filteredMedicines = medicines.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.medicineName && m.medicineName.toLowerCase().includes(q)) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 animate-fadeIn">
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
            Available Medicines & Inventory
          </h1>
          <p className="text-xs text-slate-400">
            Check real-time stock levels, pricing, and active pharmaceutical salts
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="medical-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine brand, generic composition (e.g. Paracetamol, Atorvastatin)..."
            className="w-full rounded-xl bg-slate-900/90 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Medicines List */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>{filteredMedicines.length} items in catalog</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="medical-card p-5 h-20 animate-pulse bg-slate-900/50" />
            ))}
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center">
            <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Medicines Matching Search</h4>
            <p className="text-xs text-slate-400 mt-1">
              Please contact the store directly for specialized formulations or hospital compounds.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMedicines.map((medicine) => (
              <MedicineCard key={medicine._id || medicine.id} medicine={medicine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineInventoryScreen;
