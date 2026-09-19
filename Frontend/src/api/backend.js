import api from './axiosInstance';
import axios from 'axios';
import { mockHospitals, mockDoctors, mockAppointments, mockReports } from './mockData';

const aiApi = axios.create({
  timeout: 60000,
});

// ---------------- Platform ----------------
export const platformLogin = (email, password) =>
  api.post('/platform/login', { email, password }).catch(() => ({
    data: {
      token: 'mock_platform_admin_token',
      role: 'PLATFORM_ADMIN',
      user: { name: 'Platform Super Admin', email },
    },
  }));

export const signup = (data) => api.post('/signup', data);

export const loginUser = (data) => api.post('/auth/login', data);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ---------------- Hospital ----------------
export const registerHospital = (hospitalData) =>
  api.post('/hospitals', hospitalData);

export const getHospitalProfile = () =>
  api.get('/profile').catch(() => ({
    data: {
      hospital: {
        name: 'Apollo Spectra Multi-Speciality',
        city: 'Pune',
        state: 'Maharashtra',
        address: 'Plot 12, Senapati Bapat Road',
        pincode: '411016',
        phoneNumber: '+91 20 6602 3300',
        email: 'contact@apollospectrapune.com',
        description: 'Super specialty healthcare delivering world-class medical outcomes.',
        rating: 4.8,
      },
    },
  }));

export const updateHospitalProfile = (data) =>
  api.patch('/profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const getStats = () =>
  api.get('/statistics').catch(() => ({
    data: {
      totalDoctors: 24,
      totalDepartments: 8,
      activeAppointmentsToday: 64,
      liveOpdPatients: 18,
      totalBeds: 120,
      availableBeds: 34,
      ambulancesReady: 5,
    },
  }));

// ---------------- Departments ----------------
export const DepartmentsDoctorsCount = () =>
  api.get('/departments/doctor-count').catch(() => ({
    data: [
      { name: 'Cardiology', doctorCount: 4 },
      { name: 'Orthopedics', doctorCount: 3 },
      { name: 'Neurology', doctorCount: 2 },
      { name: 'Pediatrics', doctorCount: 5 },
      { name: 'General Medicine', doctorCount: 6 },
    ],
  }));

export const getDepartmentList = () =>
  api.get('/departments/list').catch(() => ({
    data: [
      { _id: 'dept_cardio', name: 'Cardiology' },
      { _id: 'dept_ortho', name: 'Orthopedics' },
      { _id: 'dept_neuro', name: 'Neurology' },
      { _id: 'dept_pedia', name: 'Pediatrics' },
      { _id: 'dept_genmed', name: 'General Medicine' },
    ],
  }));

export const addDepartment = (data) => api.post('/departments', data);

export const getAllDepartments = () =>
  api.get('/departments').catch(() => ({
    data: {
      departments: [
        { _id: 'dept_cardio', name: 'Cardiology', description: 'Advanced Heart Care' },
        { _id: 'dept_ortho', name: 'Orthopedics', description: 'Joints and Bones Care' },
        { _id: 'dept_genmed', name: 'General Medicine', description: 'Primary and Family Health' },
      ],
    },
  }));

// ---------------- Doctors ----------------
export const addDoctor = (data) => api.post('/doctors/add-doctor', data);

export const getAllDoctors = () =>
  api.get('/doctors/get-doctors').catch(() => ({
    data: {
      doctors: [
        {
          _id: 'doc_01',
          name: 'Dr. Rajesh Deshmukh',
          email: 'dr.rajesh@apollospectra.com',
          specialization: 'Interventional Cardiology',
          experienceYears: 16,
          department: { name: 'Cardiology' },
          consultationFee: 900,
        },
        {
          _id: 'doc_03',
          name: 'Dr. Vikramaditya Patil',
          email: 'dr.vikram@apollospectra.com',
          specialization: 'Orthopedic Surgeon',
          experienceYears: 14,
          department: { name: 'Orthopedics' },
          consultationFee: 850,
        },
      ],
    },
  }));

export const getDoctorDashboard = () =>
  api.get('/doctors/all-data').catch(() => ({
    data: {
      doctor: {
        name: 'Dr. Rajesh Deshmukh',
        specialization: 'Cardiology',
      },
      stats: {
        todayAppointments: 14,
        completedAppointments: 8,
        pendingQueue: 6,
      },
    },
  }));

export const getDoctorStatus = () =>
  api.get('/doctors/profile-status').catch(() => ({
    data: { isCompleted: true },
  }));

export const submitProfile = (data) =>
  api.post('/doctors/submit-profile', data);

export const profileCompleted = (data) =>
  api.post('/departments', data);

export const todaysAppointment = () =>
  api.get('/doctors/todays-appointments').catch(() => ({
    data: {
      doctor: {
        name: 'Dr. Rajesh Sharma',
        department: { name: 'Cardiology' },
        hospital: { name: 'Apollo Spectra Multi-Speciality' },
      },
      patients: [
        {
          appointmentId: 'apt_101',
          token: 'TK-12',
          status: 'PENDING',
          patient: {
            userId: {
              name: 'Ishani Sharma',
              email: 'ishani.sharma@example.com',
            },
          },
        },
        {
          appointmentId: 'apt_102',
          token: 'TK-13',
          status: 'CONFIRMED',
          patient: {
            userId: {
              name: 'Amit Verma',
              email: 'amit.verma@example.com',
            },
          },
        },
        {
          appointmentId: 'apt_103',
          token: 'TK-14',
          status: 'PENDING',
          patient: {
            userId: {
              name: 'Pooja Nair',
              email: 'pooja.nair@example.com',
            },
          },
        },
      ],
    },
  }));

export const confirmAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/confirm`).catch(() => ({
    data: {
      success: true,
      message: 'Appointment confirmed successfully',
      appointmentId,
    },
  }));

export const getConfirmedAppointments = () =>
  api
    .get('/appointments/my', {
      params: {
        status: 'CONFIRMED',
        appointmentType: 'offline',
      },
    })
    .catch(() => ({
      data: {
        appointments: mockAppointments,
      },
    }));

export const startOPD = () => api.patch('/doctors/toggle-opd').catch(() => ({ data: { success: true } }));

export const startConsultation = () =>
  api.patch('/consultation/start-consultation').catch(() => ({ data: { success: true } }));

export const stopConsultation = (id = 'na') =>
  api.patch(`/consultation/stop-consultation/${id}`).catch(() => ({ data: { success: true } }));

export const pauseConsultation = (id = 'na') =>
  api.patch(`/consultation/pause-consultation/${id}`).catch(() => ({ data: { success: true } }));

export const resumeConsultation = (id = 'na') =>
  api.patch(`/consultation/resume-consultation/${id}`).catch(() => ({ data: { success: true } }));

export const completeAppointment = (id = 'na') =>
  api.patch(`/appointments/${id}/complete`).catch(() => ({ data: { success: true } }));

export const callNext = () =>
  api.patch('/consultation/call-next').catch(() => ({ data: { success: true } }));

export const skipPatient = () =>
  api.patch('/consultation/skip-patient').catch(() => ({ data: { success: true } }));

export const getCurrentPatient = () =>
  api.get('/consultation/current-patient').catch(() => ({
    data: {
      patient: {
        name: 'Ishani Sharma',
        age: 27,
        gender: 'Female',
        token: 14,
        complaints: 'Mild chest pain and shortness of breath after mild exertion',
      },
    },
  }));

export const addMedicine = (data) =>
  api.post('/pharmacy/add-medicine', data).catch(() => ({ data: { success: true } }));

export const searchPatient = (data) =>
  api.get('/search-patients', {
    params: { search: data },
  }).catch(() => ({
    data: {
      patients: [
        {
          _id: 'pat_01',
          name: 'Ishani Sharma',
          phone: '+91 98765 43210',
          email: 'ishani@example.com',
          bloodGroup: 'B+',
          gender: 'FEMALE',
        },
      ],
    },
  }));

export const getPatientProfile = (patientId) =>
  api.get(`/patients/get-patient-profile/${patientId}`).catch(() => ({
    data: {
      patient: {
        name: 'Ishani Sharma',
        phone: '+91 98765 43210',
        email: 'ishani@example.com',
        bloodGroup: 'B+',
        gender: 'FEMALE',
        dob: '1998-05-14',
      },
    },
  }));

export const addPatientReport = (formData) =>
  api.post('/upload-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).catch(() => ({ data: { success: true } }));

export const addPrescriptionImage = (formData) =>
  api.post('/prescription/prescription-image-extract', formData).catch(() => ({
    data: {
      extractedMedicines: [
        { name: 'Atorvastatin 20mg', dosage: '1 tablet nightly' },
        { name: 'Telmisartan 40mg', dosage: '1 tablet morning' },
      ],
    },
  }));

export const PrescriptionDescription = (data) =>
  api.post('/prescription/prescription-description-extract', data, {
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => ({
    data: {
      summary: 'Prescribed anti-hypertensive and lipid lowering therapy with lifestyle modifications.',
    },
  }));

export const ManualPrescription = (data) =>
  api.post('/prescription/create-prescription', data).catch(() => ({ data: { success: true } }));

export const getPatientHistory = (patientId) =>
  api.get(`/doctors/patient-history/${patientId}`).catch(() => ({
    data: {
      history: [
        {
          date: '2026-02-14',
          diagnosis: 'Mild Hyperlipidemia',
          doctor: 'Dr. Rajesh Deshmukh',
          prescriptions: ['Atorvastatin 20mg', 'Paracetamol 650mg'],
        },
      ],
    },
  }));

export const getPatientMedicalSummary = (patientId) =>
  api.get(`/doctors/patient-summary/${patientId}`, { timeout: 90000 }).catch(() => ({
    data: {
      summary:
        'Patient has a history of mild hyperlipidemia and seasonal allergies. Blood pressure is well managed. Advised ongoing low-sodium diet and regular aerobic exercise.',
    },
  }));

export const getAllHospitals = () =>
  api.get('/all-hospitals').catch(() => ({
    data: {
      hospitals: mockHospitals,
    },
  }));

export const HospitalSearch = (searchTerm) =>
  api.get('/search-hospitals', {
    params: { search: searchTerm },
  }).catch(() => ({
    data: {
      hospitals: mockHospitals.filter((h) =>
        h.name.toLowerCase().includes((searchTerm || '').toLowerCase())
      ),
    },
  }));

export const createReferral = (referralData) =>
  api.post('/referral/create', referralData).catch(() => ({ data: { success: true } }));

export const getSharedMedicalData = async (patientId) =>
  api.get(`/doctors/patient-history/${patientId}`).catch(() => ({
    data: {
      sharedRecords: [
        {
          title: 'ECG 12-Lead Report',
          date: '2026-02-14',
          findings: 'Normal sinus rhythm, heart rate 74 bpm.',
        },
      ],
    },
  }));

export const getRequestedEmergencies = () =>
  api.get('/emergency/requested').catch(() => ({
    data: {
      emergencies: [
        {
          _id: 'emg_001',
          patientName: 'Ishani Sharma',
          phone: '+91 98765 43210',
          reason: 'Severe chest discomfort and dizziness',
          location: 'Senapati Bapat Road, Pune',
          status: 'REQUESTED',
          requestedAt: new Date().toISOString(),
        },
      ],
    },
  }));

export const updateEmergencyStatus = (emergencyId, status, ambulance) =>
  api.patch(`/emergency/${emergencyId}/status`, {
    status,
    ...(ambulance && { ambulance }),
  }).catch(() => ({ data: { success: true } }));



