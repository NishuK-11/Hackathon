import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientNavbar } from '../components/patient/PatientNavbar';
import { PatientBottomNav } from '../components/patient/PatientBottomNav';
import { Toast } from '../components/patient/Toast';
import { IncomingCallModal } from '../components/patient/IncomingCallModal';
import { VideoCallModal } from '../components/patient/VideoCallModal';
import { EmergencySosModal } from '../components/patient/EmergencySosModal';
import { useQueueSocket } from '../hooks/useQueueSocket';

// Patient Subscreens
import { HomeScreen } from '../features/patient/HomeScreen';
import { HospitalListScreen } from '../features/patient/HospitalListScreen';
import { HospitalProfileScreen } from '../features/patient/HospitalProfileScreen';
import { DoctorListScreen } from '../features/patient/DoctorListScreen';
import { MyAppointmentsScreen } from '../features/patient/MyAppointmentsScreen';
import { LiveQueueScreen } from '../features/patient/LiveQueueScreen';
import { MyReportsScreen } from '../features/patient/MyReportsScreen';
import { PharmacyListScreen } from '../features/patient/PharmacyListScreen';
import { MedicineInventoryScreen } from '../features/patient/MedicineInventoryScreen';
import { HospitalRouteScreen } from '../features/patient/HospitalRouteScreen';
import { PatientProfileScreen } from '../features/patient/PatientProfileScreen';
import PatientAIAssistant from '../features/patient/PatientAiAssistant';

export const PatientDashboard = () => {
  // Real-time OPD token socket listener
  useQueueSocket();

  return (
    <div className="min-h-screen bg-[#05070D] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Patient Navigation Header */}
      <PatientNavbar />

      {/* Main Screen Outlet View */}
      <main className="flex-1 w-full">
        <Routes>
          <Route index element={<HomeScreen />} />
          <Route path="hospitals" element={<HospitalListScreen />} />
          <Route path="hospitals/:id" element={<HospitalProfileScreen />} />
          <Route path="doctors/:hospitalId/:departmentId" element={<DoctorListScreen />} />
          <Route path="appointments" element={<MyAppointmentsScreen />} />
          <Route path="queue" element={<LiveQueueScreen />} />
          <Route path="reports" element={<MyReportsScreen />} />
          <Route path="pharmacy" element={<PharmacyListScreen />} />
          <Route path="pharmacy/:pharmacyId/medicines" element={<MedicineInventoryScreen />} />
          <Route path="route/:hospitalId" element={<HospitalRouteScreen />} />
          <Route path="profile" element={<PatientProfileScreen />} />
          <Route path='ai-chat' element={<PatientAIAssistant />} />
          <Route path="*" element={<Navigate to="/patient-dashboard" replace />} />
          
        </Routes>
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <PatientBottomNav />

      {/* Global Interactive Telemedicine & Emergency Modals */}
      <IncomingCallModal />
      <VideoCallModal />
      <EmergencySosModal />
      <Toast />
    </div>
  );
};

export default PatientDashboard;
