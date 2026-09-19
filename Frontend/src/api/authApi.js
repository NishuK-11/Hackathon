import api from './axiosInstance';
import { mockUser, mockPatientProfile } from './mockData';

export const authApi = {
  login: async (params) => {
    try {
      const res = await api.post('/auth/login', params);
      const data = res.data;
      return {
        success: true,
        token: data.token || 'token_' + Date.now(),
        role: data.role || 'PATIENT',
        user: {
          ...data.user,
          role: data.role || (data.user && data.user.role) || 'PATIENT',
          token: data.token,
        },
      };
    } catch {
      console.info('[Auth] Using mock login response');
      return {
        success: true,
        token: mockUser.token,
        role: 'PATIENT',
        user: {
          ...mockUser,
          name: params.email ? params.email.split('@')[0] : mockUser.name,
          email: params.email || mockUser.email,
        },
      };
    }
  },

  register: async (params) => {
    try {
      const res = await api.post('/patients/register', {
        name: params.name,
        email: params.email,
        password: params.password,
        gender: params.gender,
        dob: params.dob,
        bloodGroup: params.bloodGroup,
        phone_number: params.phone,
      });
      const data = res.data;
      return {
        success: true,
        token: data.token,
        role: 'PATIENT',
        user: {
          ...data.user,
          role: 'PATIENT',
          token: data.token,
        },
      };
    } catch {
      console.info('[Auth] Using mock register response');
      return {
        success: true,
        token: 'mock_registered_token_' + Date.now(),
        role: 'PATIENT',
        user: {
          id: 'user_' + Date.now(),
          name: params.name,
          email: params.email,
          role: 'PATIENT',
          patientId: 'pat_' + Date.now(),
        },
      };
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/patients/me');
      return res.data.patient || mockPatientProfile;
    } catch {
      return mockPatientProfile;
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await api.patch('/patients/update-patient-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.patient;
    } catch {
      return mockPatientProfile;
    }
  },
};

export default authApi;
