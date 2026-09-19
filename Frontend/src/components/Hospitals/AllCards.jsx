// import React, { useEffect, useState } from 'react'
// import StatsCard from './StatsCard'
// import { Building2, CalendarDays, UserRound, Users } from 'lucide-react'
// import { getStats } from '../../api/backend';
// import { FaUserDoctor } from "react-icons/fa6";
// import { FaUsers } from "react-icons/fa6";

// const AllCards = () => {
//      const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await getStats();
//         setStats(res.data);
//       } catch (err) {
//         console.log(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//  if (loading) {
//     return <div>Loading...</div>;
//   }
//      return (
//     <div className="px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//       <StatsCard
//       title="Total Departments"
//       count={stats.countDepartment || 0}
//       icon={Building2}
//       route="/hospital-dashboard/departments"
//       bg='#008CFD'
//       options={[
//         {label:"add department",route:"/hospital-dashboard/departments/add"},{label:"edit department",route:"/hospital-dashboard/departments"}
//       ]}
//     />

//       <StatsCard
//       title="Total Doctors"
//       count={stats.countDoctor || 5}
//       icon={FaUserDoctor}
//       route="/hospital-dashboard/doctors"
//       bg='#003099'
//       options={[
//         { label: "add doctor", route: "/hospital-dashboard/doctors/add"},
//         { label: "delete doctor", route: "/hospital-dashboard/doctors/add" }
//       ]}
//     />
//      <StatsCard
//       title="Total Appointments Today"
//       count={stats.countAppointment || 0}
//       icon={CalendarDays}
//       route="/hospital-dashboard/appointments"
//       bg='#4a48db'
//       options={[
//         {label:"today appointment",route:"/hospital-dashboard/appointments/"}
//       ]}
//     />

//     <StatsCard
//       title="Total Patients Today"
//       count={stats.countPatient || 0}
//       icon={FaUsers}
//       route="/hospital-dashboard/patients"
//       bg='#0f50f1'
//       options={[
//         {label:"todays patients",route:"/hospital-dashboard/patients/today"}
//       ]}
//     />

//     </div>
//   )
// }

// export default AllCards





import React from 'react'
import StatsCard from './StatsCard'
import { Building2, CalendarDays } from 'lucide-react'
import { FaUserDoctor, FaUsers } from "react-icons/fa6";
import { useStats } from '../../hooks/useStats'

const AllCards = () => {
  // Cached under queryKeys.hospitalStats. Navigating away (e.g. to
  // Today's Appointments) and back re-mounts this component, but the
  // cache survives - isLoading stays false on return, so no reload.
  const { data: stats, isLoading, isError, refetch } = useStats();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 text-white">
        <span>Could not load stats.</span>
        <button onClick={() => refetch()} className="underline text-blue-400">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <StatsCard
        title="Total Departments"
        count={stats.countDepartment || 0}
        icon={Building2}
        route="/hospital-dashboard/departments"
        bg='#008CFD'
        options={[
          { label: "add department", route: "/hospital-dashboard/departments/add" },
          { label: "edit department", route: "/hospital-dashboard/departments" }
        ]}
      />

      <StatsCard
        title="Total Doctors"
        count={stats.countDoctor || 5}
        icon={FaUserDoctor}
        route="/hospital-dashboard/doctors"
        bg='#003099'
        options={[
          { label: "add doctor", route: "/hospital-dashboard/doctors/add" },
          { label: "delete doctor", route: "/hospital-dashboard/doctors/add" }
        ]}
      />
      <StatsCard
        title="Total Appointments Today"
        count={stats.countAppointment || 0}
        icon={CalendarDays}
        route="/hospital-dashboard/appointments"
        bg='#4a48db'
        options={[
          { label: "today appointment", route: "/hospital-dashboard/appointments/" }
        ]}
      />

      <StatsCard
        title="Total Patients Today"
        count={stats.countPatient || 0}
        icon={FaUsers}
        route="/hospital-dashboard/patients"
        bg='#0f50f1'
        options={[
          { label: "todays patients", route: "/hospital-dashboard/patients/today" }
        ]}
      />

    </div>
  )
}

export default AllCards