import React, { useMemo, useState } from "react";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  PackagePlus,
  ShieldAlert,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const riskStyles = {
  High: {
    box: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    icon: "text-red-600",
  },
  Medium: {
    box: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    icon: "text-amber-600",
  },
  Low: {
    box: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    icon: "text-emerald-600",
  },
};

const TrendIcon = ({ trend }) => {
  if (trend === "Increasing") return <TrendingUp size={15} />;
  if (trend === "Decreasing") return <TrendingDown size={15} />;
  return <Minus size={15} />;
};

const MiniForecast = ({ forecast }) => {
  const values = (forecast || []).map((point) => Number(point.demand || 0));
  const max = Math.max(...values, 1);
  return (
    <div className="mt-3 flex h-20 items-end gap-1.5">
      {values.map((value, index) => (
        <div key={`${forecast[index]?.date}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex h-14 w-full items-end rounded-md bg-slate-200/70 px-0.5 dark:bg-slate-800">
            <div
              className="w-full rounded-sm bg-blue-500 transition-all"
              style={{ height: `${Math.max((value / max) * 100, value > 0 ? 8 : 2)}%` }}
              title={`${forecast[index]?.date || ""}: ${value} units`}
            />
          </div>
          <span className="truncate text-[9px] text-slate-400">{forecast[index]?.date || ""}</span>
        </div>
      ))}
    </div>
  );
};

const PharmacyAIInsights = ({ aiInsights }) => {
  const [expanded, setExpanded] = useState(null);

  const forecasts = aiInsights?.forecasts || [];
  const summary = aiInsights?.summary || {
    highRisk: 0,
    mediumRisk: 0,
    increasingDemand: 0,
    suggestedRestockUnits: 0,
  };

  const needsAttention = useMemo(
    () => forecasts.filter((item) => item.risk !== "Low" || item.recommendedRestock > 0),
    [forecasts]
  );

  return (
    <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm dark:border-blue-900/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BrainCircuit size={21} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">AI demand insights</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Sparkles size={11} /> ML
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                7-day medicine demand forecast. Real pharmacy history is preferred; the cold-start model is pre-trained on M5 retail demand.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-white/80 px-3 py-2 shadow-sm dark:bg-slate-900/70">
            <p className="font-bold text-red-600">{summary.highRisk}</p>
            <p className="mt-0.5 text-slate-500">High risk</p>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 shadow-sm dark:bg-slate-900/70">
            <p className="font-bold text-amber-600">{summary.mediumRisk}</p>
            <p className="mt-0.5 text-slate-500">Medium</p>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 shadow-sm dark:bg-slate-900/70">
            <p className="font-bold text-blue-600">{summary.suggestedRestockUnits}</p>
            <p className="mt-0.5 text-slate-500">Restock units</p>
          </div>
        </div>
      </div>

      {!forecasts.length ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <BrainCircuit className="mx-auto text-blue-500" size={28} />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">AI forecast is ready</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            More delivered-order history is needed before medicine-level predictions can be generated.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {forecasts.slice(0, 6).map((item) => {
              const styles = riskStyles[item.risk] || riskStyles.Low;
              const open = expanded === item.medicineId?.toString();

              return (
                <div key={item.medicineId} className={`rounded-xl border p-4 ${styles.box}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {item.medicineName}
                        {item.strength ? ` · ${item.strength}` : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <TrendIcon trend={item.trend} /> {item.trend}
                        </span>
                        <span>Model: {item.model}</span>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${styles.badge}`}>
                      {item.risk} risk
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-900/60">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Current stock</p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{item.currentStock}</p>
                    </div>
                    <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-900/60">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">7-day forecast</p>
                      <p className="mt-1 text-lg font-bold text-blue-600">{item.predicted7DayDemand}</p>
                    </div>
                    <div className="rounded-lg bg-white/80 p-3 dark:bg-slate-900/60">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Suggested restock</p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{item.recommendedRestock}</p>
                    </div>
                  </div>

                  <MiniForecast forecast={item.forecast} />

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <PackagePlus size={14} />
                      {item.coverageDays == null ? "No demand coverage estimate" : `${item.coverageDays} days of stock coverage`}
                    </div>
                    <button
                      onClick={() => setExpanded(open ? null : item.medicineId?.toString())}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-white/70 dark:text-blue-300 dark:hover:bg-slate-900/50"
                    >
                      Details <ChevronDown size={14} className={open ? "rotate-180" : ""} />
                    </button>
                  </div>

                  {open && (
                    <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <p><span className="font-semibold">Active sales days:</span> {item.activeSalesDays}</p>
                        <p><span className="font-semibold">Historical demand:</span> {item.totalHistoricalDemand} units</p>
                        <p><span className="font-semibold">Avg daily demand:</span> {item.predictedDailyDemand} units</p>
                        <p><span className="font-semibold">Training source:</span> {item.trainingSource === "real_pharmacy_history" ? "Real pharmacy history" : item.trainingSource === "m5_base_model" ? "M5 retail-demand base model" : "Fallback"}</p>
                        <p className="flex items-center gap-1"><ShieldAlert size={13} /><span className="font-semibold">Forecast horizon:</span> {aiInsights.forecastDays} days</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-xs dark:bg-slate-900/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">AI summary:</span>
            <span className="text-slate-500 dark:text-slate-400">{summary.increasingDemand} medicines show increasing demand.</span>
            {needsAttention.length > 0 && (
              <span className="font-semibold text-amber-600">
                {needsAttention.length} medicines need attention.
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default PharmacyAIInsights;
