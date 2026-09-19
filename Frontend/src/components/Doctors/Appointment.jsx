

import React from 'react'
import { Users } from 'lucide-react'
import { useTodaysAppointments } from '../../hooks/useTodaysAppointments'
import { useConfirmAppointment } from '../../hooks/useConfirmAppointment'

const statusStyles = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const Appointment = () => {
  const { data, isLoading, isError, error, refetch } = useTodaysAppointments()
  const confirmMutation = useConfirmAppointment()

  const doctor = data?.doctor
  const patients = data?.patients ?? []


  if (isError) {
    // 🐛 DEBUG: full error object, including server response if axios
    console.error('[Appointment] fetch error:', error)
    console.error('[Appointment] error.response?.data:', error?.response?.data)
  }

  const handleConfirm = (appointmentId) => {
    if (!appointmentId) {
      console.warn('[Appointment] handleConfirm called with falsy appointmentId!')
    }
    confirmMutation.mutate(appointmentId, {
      onError: (err) => {
        console.error('[Appointment] confirm mutation failed:', err?.response?.data || err)
      },
      onSuccess: (res) => {
        console.log('[Appointment] confirm mutation success:', res)
      },
    })
  }

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 ">
        <div>
          <h1 className="text-6xl font-bold text-blue-300">Today's Appointments</h1>
          {doctor && (
            <p className="text-2xl text-slate-300 mt-7">
              {doctor.department?.name
                ? doctor.department.name.charAt(0).toUpperCase() + doctor.department.name.slice(1)
                : '(no department)'}
              {' · '}
              {doctor.hospital?.name || '(no hospital)'}
            </p>
          )}
        </div>
        {!isLoading && !isError && (
          <div className="inline-flex items-center gap-4 rounded-2xl border border-violet-500/20 bg-[#111827] px-6 py-4 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15">
              <Users className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Today's Patients</p>
              <h2 className="text-3xl font-bold text-white">{patients.length}</h2>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between">
          <p className="text-sm text-rose-700">
            Could not load today's appointments. Please try again.
            {/* 🐛 DEBUG: show raw error message on screen too */}
            {error?.message && (
              <span className="block text-xs text-rose-400 mt-1">
                ({error.message})
              </span>
            )}
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-rose-700 underline hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && patients.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No appointments booked for today.</p>
        </div>
      )}

      {/* Appointment list */}
      {!isLoading && !isError && patients.length > 0 && (
        <ul className="space-y-3">
          {patients.map((p) => {
            const isBusy =
              confirmMutation.isPending &&
              confirmMutation.variables === p.appointmentId
            const isFinal = p.status === 'CONFIRMED' || p.status === 'CANCELLED'

            return (
              <li
                key={p.appointmentId}
                className="flex items-center justify-between gap-4 rounded-xl border border-blue-800/20 bg-blue-800/10 p-4 shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center px-7 py-3 rounded-lg bg-green-900 text-white shrink-0">
                    <span className="text-[15px] uppercase tracking-wide text-slate-300">Token</span>
                    <span className="text-base font-semibold leading-none">{p.token}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl text-white truncate">{p.patient?.userId?.name}</p>
                    <p className="text-md text-slate-400 truncate">{p.patient?.userId?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  <span
                    className={`text-md font-medium px-4 py-2 rounded-full border ${
                      statusStyles[p.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {p.status}
                  </span>

                  {!isFinal && (
                    <>
                      <button
                        onClick={() => handleConfirm(p.appointmentId)}
                        disabled={isBusy}
                        className="text-md font-medium px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isBusy ? '...' : 'Confirm'}
                      </button>
                      <button
                        disabled={isBusy}
                        className="text-md font-medium px-6 py-3 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isBusy ? '...' : 'Cancel'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Appointment