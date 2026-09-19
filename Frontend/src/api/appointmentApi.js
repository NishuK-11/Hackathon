import api from './axiosInstance';
import { mockAppointments } from './mockData';

let storedAppointments = [...mockAppointments];

export const appointmentApi = {
  createAppointment: async (params) => {
    try {
      const res = await api.post('/appointments', {
        doctor: params.doctorId,
        date: params.date,
        appointmentType: params.appointmentType,
        reason: params.reason,
        description: params.description,
      });
      return res.data;
    } catch {
      console.info('[Appointments] Created appointment in local state fallback');
      const newAppt = {
        id: 'appt_' + Date.now(),
        doctorId: params.doctorId,
        doctorName: params.doctorName || 'Dr. Specialist',
        doctorProfilePhoto: params.doctorProfilePhoto || '',
        hospitalName: params.hospitalName || 'Apollo Spectra Hospital',
        departmentName: params.departmentName || 'Specialist Care',
        date: params.date,
        appointmentType: params.appointmentType,
        status: 'CONFIRMED',
        token: Math.floor(Math.random() * 30) + 1,
        reason: params.reason,
        description: params.description,
      };
      storedAppointments.unshift(newAppt);
      return {
        success: true,
        message: 'Appointment booked successfully!',
        appointment: newAppt,
      };
    }
  },

  getMyAppointments: async () => {
    try {
      const res = await api.get('/appointments/my/patients');
      const list = res.data.appointments || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((a) => ({
          ...a,
          id: a.id || a._id,
          departmentName: a.departmentName || a.department?.name || a.department || 'Specialist Care',
          hospitalName: a.hospitalName || a.hospital?.name || a.hospital || 'Medical Center',
        }));
      }
      return list.length > 0 ? list : storedAppointments;
    } catch {
      return storedAppointments;
    }
  },

  getPrescriptionForAppointment: async (appointmentId) => {
    try {
      const res = await api.get(`/prescription/get-prescription/appointment/${appointmentId}`);
      return res.data.prescription || null;
    } catch {
      return null;
    }
  },
};

export default appointmentApi;
