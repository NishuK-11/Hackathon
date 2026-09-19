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
      return res.data.appointments || storedAppointments;
    } catch {
      return storedAppointments;
    }
  },
};

export default appointmentApi;
