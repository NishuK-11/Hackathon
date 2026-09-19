import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import SelectRole from '../pages/Auth/SelectRole';
import HospitalSignup from '../pages/Auth/HospitalSignup';
import PatientSignup from '../pages/Auth/PatientSignup';
import LabSignup from '../pages/Auth/LabSignup';
import Login from '../pages/Login';
import PharmacySignup from '../pages/Auth/PharmacySignup';
import ProtectedRoutes from './protectedRoutes';
import HospitalDashboard from '../pages/HospitalDashboard';
import LoginPlatformAdmin from '../pages/Auth/LoginPlatformAdmin';
import PlatFormDashboard from '../pages/PlatFormDashboard';
import { ROLE } from '../constants/Role';
import PublicRoute from './PublicRoute';
import AddDepartment from '../features/Admin/AddDepartment';
import CompleteProfile from '../features/Admin/CompleteProfile';
import Profile from '../components/Hospitals/Profile';
import DoctorDashboard from '../pages/DoctorDashboard';
import AllDepartments from '../features/Admin/AllDepartments';
import HospitalLayout from '../pages/HospitalLayout';
import AddDoctor from '../features/Admin/AddDoctor';
import AllDoctor from '../features/Admin/AllDoctor';
import Appointment from '../components/Doctors/Appointment';
import OpdSchedule from '../features/Admin/OpdSchedule';
import NotificationSection from '../features/doctor/NotificationSection';
import PharmacyDashboard from '../components/Pharmacy/PharmacyDashboard';
import PharmacyLayout from '../features/pharmacy/PharmacyLayout';
import AddMedicine from '../features/pharmacy/AddMedicine';
import PatientProfileAdmin from '../features/Admin/PatientProfileAdmin';
import PatientProfileDoctor from '../features/doctor/PatientProfileDoctor';
import PrescriptionOptions from '../features/doctor/PrescritionOptions';
import PatientHistory from '../features/doctor/PatientHistory';
import AllHospitals from '../common/AllHospitals';
import SharedMedicalData from '../features/doctor/SharedMedicalData';
import VideoCallPage from '../features/doctor/VideoCallPage';

// Patient & Lab Dashboards
import PatientDashboard from '../pages/PatientDashboard';
import LabDashboard from '../pages/LabDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing & Authentication */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route path="/signup" element={<SelectRole />} />
      <Route path="/signup/hospital" element={<HospitalSignup />} />
      <Route path="/signup/patient" element={<PatientSignup />} />
      <Route path="/register" element={<PatientSignup />} />
      <Route path="/signup/lab" element={<LabSignup />} />
      <Route path="/signup/pharmacy" element={<PharmacySignup />} />
      <Route path="/pharmacy/signup" element={<PharmacySignup />} />
      <Route path="/admin/login" element={<LoginPlatformAdmin />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Patient Portal (Protected) */}
      <Route
        path="/patient-dashboard/*"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.patient]}>
            <PatientDashboard />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/patient/*"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.patient]}>
            <PatientDashboard />
          </ProtectedRoutes>
        }
      />

      {/* Diagnostic Pathology Lab Portal (Protected) */}
      <Route
        path="/lab-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.lab]}>
            <LabDashboard />
          </ProtectedRoutes>
        }
      />

      {/* Platform Super Admin */}
      <Route
        path="/platform-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.platform_admin]}>
            <PlatFormDashboard />
          </ProtectedRoutes>
        }
      />

      {/* Hospital Admin Portal */}
      <Route
        path="/hospital-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.admin, ROLE.hospital_admin]}>
            <HospitalLayout />
          </ProtectedRoutes>
        }
      >
        <Route index element={<HospitalDashboard />} />
        <Route path="departments" element={<AllDepartments />} />
        <Route path="departments/add" element={<AddDepartment />} />
        <Route path="doctors/add" element={<AddDoctor />} />
        <Route path="doctors" element={<AllDoctor />} />
        <Route path="doctor/opd-schedule/:doctorId" element={<OpdSchedule />} />
        <Route path="patients/:id" element={<PatientProfileAdmin />} />
        <Route path="patient-report/:id" element={<PatientProfileAdmin />} />
        <Route path="all-hospitals" element={<AllHospitals />} />
      </Route>

      <Route
        path="/hospital-dashboard/profile"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.admin, ROLE.hospital_admin]}>
            <CompleteProfile />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/hospital-dashboard/hospital-profile"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.admin, ROLE.hospital_admin]}>
            <Profile />
          </ProtectedRoutes>
        }
      />

      {/* Doctor Portal */}
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.doctor]}>
            <HospitalLayout />
          </ProtectedRoutes>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<Appointment />} />
        <Route path="notifications" element={<NotificationSection />} />
        <Route path="doctor-dashboard/video-call" element={<VideoCallPage />} />
        <Route path="patients/:id" element={<PatientProfileDoctor />} />
        <Route path="patients/:id/prescription" element={<PrescriptionOptions />} />
        <Route path="patients/:id/history" element={<PatientHistory />} />
        <Route path="patients/:id/shared-data" element={<SharedMedicalData />} />
      </Route>

      {/* Pharmacy Portal */}
      <Route
        path="/pharmacy-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.pharmacy]}>
            <PharmacyLayout />
          </ProtectedRoutes>
        }
      >
        <Route index element={<PharmacyDashboard />} />
        <Route path="add-medicine" element={<AddMedicine />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;