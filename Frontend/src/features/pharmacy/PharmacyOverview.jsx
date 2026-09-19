import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  CircleAlert,
  PackageCheck,
  Pill,
  RefreshCw,
  IndianRupee,
} from "lucide-react";
import api from "../../api/axiosInstance";
import PharmacyAIInsights from "../../components/Pharmacy/PharmacyAIInsights";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StatCard = ({ title, value, subtitle, icon: Icon, tone, trend }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {trend.direction === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend.text}
      </div>
    )}
  </div>
);

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((item) => Number(item.quantity || 0)), 1);

  return (
    <div className="flex h-64 items-end gap-3 pt-6">
      {data.map((item) => {
        const height = Math.max((Number(item.quantity || 0) / max) * 100, item.quantity ? 6 : 2);
        return (
          <div key={item.name} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.quantity}</span>
            <div className="flex h-44 w-full items-end rounded-lg bg-slate-100 px-1 dark:bg-slate-800">
              <div className="w-full rounded-md bg-blue-600 transition-all" style={{ height: `${height}%` }} />
            </div>
            <span className="w-full truncate text-center text-[11px] text-slate-500 dark:text-slate-400">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const LineChart = ({ data }) => {
  const width = 700;
  const height = 260;
  const padX = 28;
  const padY = 28;
  const values = data.map((item) => Number(item.sales || 0));
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = padX + index * step;
    const y = height - padY - (Number(item.sales || 0) / max) * (height - padY * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 min-w-[620px] w-full">
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600" />
        {data.map((item, index) => {
          const x = padX + index * step;
          const y = height - padY - (Number(item.sales || 0) / max) * (height - padY * 2);
          return (
            <g key={`${item.date}-${index}`}>
              <circle cx={x} cy={y} r="5" className="fill-blue-600" />
              <text x={x} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[11px]">{item.date}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Donut = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const summary = data.map((item) => `${item.name}: ${item.value}`).join(" • ");
  const segments = data.map((item) => Number(item.value || 0));
  const first = total ? (segments[0] / total) * 100 : 0;
  const second = total ? first + (segments[1] / total) * 100 : 0;
  const gradient = `conic-gradient(#2563eb 0 ${first}%, #f59e0b ${first}% ${second}%, #ef4444 ${second}% 100%)`;

  return (
    <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
          <span className="text-[11px] text-slate-500">Medicines</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{title}</p>
        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{summary || "No inventory data yet"}</p>
        <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {data.map((item, index) => (
            <div className="flex items-center justify-between gap-4" key={item.name}>
              <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-blue-600" : index === 1 ? "bg-amber-500" : "bg-red-500"}`} />{item.name}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PharmacyOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/pharmacy/dashboard");
      setData(response.data);
    } catch (err) {
      console.error("Pharmacy dashboard error:", err);
      setError(err?.response?.data?.message || "Unable to load pharmacy dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const topMedicines = useMemo(() => data?.charts?.topMedicines || [], [data]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-125px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <RefreshCw size={17} className="animate-spin" /> Loading pharmacy analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <CircleAlert className="mx-auto text-red-500" size={30} />
        <h2 className="mt-3 text-lg font-semibold text-red-700 dark:text-red-300">Dashboard could not be loaded</h2>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/80">{error || "Please try again."}</p>
        <button onClick={fetchDashboard} className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Retry</button>
      </div>
    );
  }

  const { stats, charts, alerts, pharmacy } = data;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Pharmacy analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Welcome, {pharmacy?.shopName || "Pharmacy"}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your inventory, sales and expiry insights in one place.</p>
        </div>
        <button onClick={fetchDashboard} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total medicines" value={stats.totalMedicines} subtitle="Active medicine records" icon={Pill} tone="bg-blue-50 text-blue-600 dark:bg-blue-950/40" />
        <StatCard title="Total stock" value={stats.totalStock.toLocaleString("en-IN")} subtitle="Units currently available" icon={Boxes} tone="bg-violet-50 text-violet-600 dark:bg-violet-950/40" />
        <StatCard title="Low stock" value={stats.lowStock} subtitle={`Threshold ≤ ${data.rules.lowStockThreshold} units`} icon={AlertTriangle} tone="bg-amber-50 text-amber-600 dark:bg-amber-950/40" />
        <StatCard title="Expiring soon" value={stats.expiringSoon} subtitle={`Within ${data.rules.expiringSoonDays} days`} icon={CalendarClock} tone="bg-orange-50 text-orange-600 dark:bg-orange-950/40" />
        <StatCard title="Today's sales" value={money(stats.todaysSales)} subtitle={`${stats.todaysOrders} delivered orders`} icon={IndianRupee} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">7-day sales trend</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Delivered-order revenue from your pharmacy.</p>
            </div>
            <PackageCheck className="text-blue-600" size={20} />
          </div>
          {charts.salesTrend?.length ? <LineChart data={charts.salesTrend} /> : <EmptyState />}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Inventory value</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current stock × medicine price.</p>
          <div className="mt-7 rounded-xl bg-slate-50 p-6 dark:bg-slate-800/70">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{money(stats.stockValuation)}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Estimated current inventory valuation</p>
          </div>
          <div className="mt-6"><Donut data={charts.stockStatus || []} title="Stock health" /></div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Most sold medicines</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Based on delivered orders from the last 7 days.</p>
          {topMedicines.length ? <BarChart data={topMedicines} /> : <EmptyState />}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Expiry overview</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prioritize medicines that need attention.</p>
          <div className="mt-8"><Donut data={charts.expiryStatus || []} title="Expiry health" /></div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Stock alerts</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Medicines that need replenishment.</p>
            </div>
            <AlertTriangle className="text-amber-600" size={21} />
          </div>
          <div className="mt-4 space-y-2">
            {alerts.lowStock?.length ? alerts.lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-white px-4 py-3 dark:border-amber-900/50 dark:bg-slate-900">
                <div><p className="text-sm font-semibold text-slate-800 dark:text-white">{item.medicineName} {item.strength ? `· ${item.strength}` : ""}</p><p className="text-xs text-slate-500">Reorder threshold: {item.threshold}</p></div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">{item.stock} left</span>
              </div>
            )) : <EmptyAlert text="No low-stock medicines right now." />}
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Expiry alerts</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Review soon-to-expire and expired batches.</p>
            </div>
            <CalendarClock className="text-red-600" size={21} />
          </div>
          <div className="mt-4 space-y-2">
            {alerts.expiry?.length ? alerts.expiry.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-white px-4 py-3 dark:border-red-900/50 dark:bg-slate-900">
                <div><p className="text-sm font-semibold text-slate-800 dark:text-white">{item.medicineName}</p><p className="text-xs text-slate-500">Batch: {item.batchNumber || "—"}</p></div>
                <div className="text-right"><p className={`text-xs font-bold ${item.expired ? "text-red-600" : "text-orange-600"}`}>{item.expired ? "Expired" : "Expiry"}</p><p className="text-[11px] text-slate-500">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-IN") : "—"}</p></div>
              </div>
            )) : <EmptyAlert text="No expiry alerts right now." />}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Medicine inventory</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Medicines currently recorded for your pharmacy.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{(data.inventory || []).length} records</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-3 font-semibold">Medicine</th>
                <th className="px-3 py-3 font-semibold">Strength</th>
                <th className="px-3 py-3 font-semibold">Batch No.</th>
                <th className="px-3 py-3 text-right font-semibold">Stock</th>
                <th className="px-3 py-3 text-right font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Expiry</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.inventory || []).map((medicine) => {
                const expiryDate = medicine.expiryDate ? new Date(medicine.expiryDate) : null;
                const isExpired = medicine.status === "EXPIRED" || (expiryDate && expiryDate < new Date());
                const stock = Number(medicine.stock || 0);
                const threshold = data.rules?.lowStockThreshold || 10;
                const status = isExpired ? "Expired" : stock <= 0 ? "Out of stock" : stock <= threshold ? "Low stock" : "In stock";
                const badge = isExpired || stock <= 0 ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" : stock <= threshold ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
                return (
                  <tr key={medicine.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-white">{medicine.medicineName || "—"}</td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{medicine.strength || "—"}</td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{medicine.batchNumber || "—"}</td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-800 dark:text-white">{stock}</td>
                    <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-300">{money(medicine.price)}</td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{expiryDate ? expiryDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badge}`}>{status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!(data.inventory || []).length && <p className="py-8 text-center text-sm text-slate-500">No medicines recorded yet.</p>}
        </div>
      </section>

      <PharmacyAIInsights aiInsights={data.aiInsights} />
    </div>
  );
};

const EmptyState = () => <div className="flex h-64 items-center justify-center text-sm text-slate-400">No sales data available yet.</div>;
const EmptyAlert = ({ text }) => <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">{text}</div>;

export default PharmacyOverview;
