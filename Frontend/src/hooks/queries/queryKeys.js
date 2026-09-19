// Central place for every React Query cache key.
// Keeping these as functions avoids typos and makes invalidation predictable.

export const queryKeys = {
  hospitalProfile: ["hospital", "profile"],

  doctorStatus: ["doctor", "status"],
  doctorDashboard: ["doctor", "dashboard"],
  confirmedAppointments: ["appointments", "confirmed"],
  todaysAppointments: ["appointments", "today"],

  hospitalStats: ["hospital", "stats"],
  allDoctors:["doctors","all"],
  allDepartments:["departments","all"],
};