
import { useState } from "react";
import { logout } from "../api/backend";
import Profile from "../components/Hospitals/Profile";
import AllCards from "../components/Hospitals/AllCards";
import IntroSection from "../components/Hospitals/IntroSection";
import DepartmentProfile from "../features/Admin/DepartmentProfile";
import DoctorStatus from "../features/Admin/DoctorStatus";
import AllHospitals from "../common/AllHospitals";
import AmbulanceTracker from "../features/Admin/AmbulanceTracker";

/* ------------------ Main Component ------------------ */

export default function HospitalDashboard() {
  return (
    <>
    <AmbulanceTracker />
     <IntroSection />
      <AllCards />
      <DoctorStatus />
    </>
  );
}
