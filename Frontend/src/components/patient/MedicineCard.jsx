import React from 'react';
import { Pill, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const MedicineCard = ({ medicine }) => {
  const { t } = useTranslation();

  return (
    <div className="medical-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Pill className="h-6 w-6" />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {medicine.medicineName}
            </h4>
            {medicine.prescriptionRequired && (
              <span className="flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-rose-400">
                <ShieldAlert className="w-2.5 h-2.5" />
                Rx Req
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            {medicine.strength && <span className="text-blue-300 font-medium">{medicine.strength}</span>}
            {medicine.genericName && <span>• {medicine.genericName}</span>}
          </div>

          {medicine.manufacturer && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mfr: {medicine.manufacturer}
            </p>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-base sm:text-lg font-extrabold text-white">
          ₹{medicine.price}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5 text-xs">
          {medicine.stock > 0 ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t.stock}: {medicine.stock}
            </span>
          ) : (
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
