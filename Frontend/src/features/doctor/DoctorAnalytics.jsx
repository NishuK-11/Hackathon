import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDoctorAnalytics } from "../../api/doctorAnalytics";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const statusColors = {
  COMPLETED: "bg-emerald-500",
  CONFIRMED: "bg-blue-500",
  PENDING: "bg-yellow-500",
  CANCELLED: "bg-red-500",
  SKIPPED: "bg-orange-500",
  CURRENT: "bg-purple-500",
};

const DoctorAnalytics = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctor-analytics", days],
    queryFn: () => getDoctorAnalytics(days),
  });

  if (isLoading) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <p className="text-center text-slate-300">
          Loading doctor analytics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 rounded-3xl border border-red-500/20 bg-slate-900 p-8">
        <h3 className="font-semibold text-red-400">
          Unable to load doctor analytics
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  const analytics = data?.analytics;

  if (!analytics) {
    return null;
  }

  const performance = analytics.performance || {};
  const consultation = analytics.consultationAnalytics || {};
  const patients = analytics.patientAnalytics || {};

  const appointmentTrend = analytics.appointmentTrend || [];
  const appointmentStatus = analytics.appointmentStatus || [];

  const maxAppointments = Math.max(
    ...appointmentTrend.map((item) => item.total || 0),
    1
  );

  const totalStatusAppointments = appointmentStatus.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  return (
    <section className=" space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-400">
            DOCTOR ANALYTICS
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            Practice Insights
          </h2>

          <p className="mt-2 text-slate-400">
            Real-time insights generated from your appointment records.
          </p>
        </div>

        {/* PERIOD FILTER */}
        <div className="flex w-fit rounded-xl border border-slate-700 bg-slate-900 p-1">
          <button
            onClick={() => setDays(7)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              days === 7
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            7 Days
          </button>

          <button
            onClick={() => setDays(30)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              days === 30
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* =====================================================
          TOP ANALYTICS CARDS
      ===================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* New Patients */}
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 p-5 shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              New Patients
            </p>

            <div className="rounded-xl bg-blue-500/20 px-3 py-2 text-xl">
              👥
            </div>
          </div>

          <h3 className="mt-5 text-4xl font-bold text-white">
            {patients.newPatients ?? 0}
          </h3>

          <p className="mt-2 text-sm text-blue-400">
            Last {days} days
          </p>
        </div>

        {/* Returning Patients */}
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 via-slate-900 to-slate-900 p-5 shadow-xl shadow-orange-500/5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Returning Patients
            </p>

            <div className="rounded-xl bg-orange-500/20 px-3 py-2 text-xl">
              🔄
            </div>
          </div>

          <h3 className="mt-5 text-4xl font-bold text-white">
            {patients.returningPatients ?? 0}
          </h3>

          <p className="mt-2 text-sm text-orange-400">
            Repeat visitors
          </p>
        </div>

        {/* Unique Patients */}
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 via-slate-900 to-slate-900 p-5 shadow-xl shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Unique Patients
            </p>

            <div className="rounded-xl bg-purple-500/20 px-3 py-2 text-xl">
              🧑‍⚕️
            </div>
          </div>

          <h3 className="mt-5 text-4xl font-bold text-white">
            {patients.uniquePatients ?? 0}
          </h3>

          <p className="mt-2 text-sm text-purple-400">
            Total patients
          </p>
        </div>

        {/* Completion Rate */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 p-5 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Completion Rate
            </p>

            <div className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xl">
              ✓
            </div>
          </div>

          <h3 className="mt-5 text-4xl font-bold text-white">
            {performance.completionRate ?? 0}%
          </h3>

          <p className="mt-2 text-sm text-emerald-400">
            Appointment completion
          </p>
        </div>
      </div>

      {/* =====================================================
          CHARTS ROW
          Appointment Trend + Appointment Status
      ===================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ===================================================
            APPOINTMENT TREND
        =================================================== */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Appointment Trend
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Daily appointments for the last {days} days.
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 px-3 py-2 text-xl">
              📈
            </div>
          </div>

          {appointmentTrend.length === 0 ? (
            <div className="flex h-56 items-center justify-center">
              <p className="text-slate-500">
                No appointment data available.
              </p>
            </div>
          ) : (
            <div className="flex h-56 items-end gap-1 overflow-x-auto pb-7">
              {appointmentTrend.map((item) => {
                const height =
                  ((item.total || 0) / maxAppointments) * 100;

                return (
                  <div
                    key={item._id}
                    className="flex min-w-[32px] flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[10px] font-semibold text-white">
                      {item.total}
                    </span>

                    <div className="flex h-36 w-full items-end rounded-md bg-slate-800/80">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                        style={{
                          height: `${Math.max(height, 5)}%`,
                        }}
                        title={`${item.total} appointments`}
                      />
                    </div>

                    <span className="mt-2 whitespace-nowrap text-[9px] text-slate-500">
                      {formatDate(item._id)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================
            APPOINTMENT STATUS
        =================================================== */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Appointment Status
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Status distribution for the selected period.
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/10 px-3 py-2 text-xl">
              📊
            </div>
          </div>

          <div className="space-y-4">
            {appointmentStatus.length === 0 ? (
              <div className="flex h-44 items-center justify-center">
                <p className="text-slate-500">
                  No status data available.
                </p>
              </div>
            ) : (
              appointmentStatus.map((item) => {
                const percentage =
                  totalStatusAppointments > 0
                    ? (item.count / totalStatusAppointments) * 100
                    : 0;

                return (
                  <div key={item._id}>

                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            statusColors[item._id] || "bg-slate-500"
                          }`}
                        />

                        <span className="text-sm text-slate-300">
                          {item._id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {percentage.toFixed(0)}%
                        </span>

                        <span className="text-sm font-semibold text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          statusColors[item._id] || "bg-slate-500"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* =====================================================
          PERFORMANCE + CONSULTATION
      ===================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* PERFORMANCE */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Performance Overview
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Appointment performance for the selected period.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xl">
              🎯
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-slate-800/80 p-5">
              <p className="text-sm text-slate-400">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {performance.totalAppointments ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 p-5">
              <p className="text-sm text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {performance.completedAppointments ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-5">
              <p className="text-sm text-slate-400">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                {performance.cancelledAppointments ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-orange-500/10 p-5">
              <p className="text-sm text-slate-400">
                Cancellation Rate
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-400">
                {performance.cancellationRate ?? 0}%
              </p>
            </div>

          </div>
        </div>

        {/* CONSULTATION */}
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 p-6 shadow-xl">

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-500/20 p-3 text-xl">
                ⏱️
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Consultation Analytics
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Insights from completed consultations.
                </p>
              </div>

            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">
                Average Consultation
              </p>

              <p className="mt-2 text-3xl font-bold text-cyan-400">
                {consultation.averageConsultationMinutes ?? 0}

                <span className="ml-1 text-sm text-slate-400">
                  minutes
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">
                Completed Consultations
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {consultation.totalCompletedConsultations ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Completion Rate
                </p>

                <p className="text-2xl font-bold text-blue-400">
                  {performance.completionRate ?? 0}%
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(performance.completionRate) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default DoctorAnalytics;