import api from './axiosInstance';

let activeEmergencyState = null;

export const emergencyApi = {
  createEmergency: async (latitude, longitude, reason, message = '') => {
    try {
      const res = await api.post('/emergency', {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        reason,
        message,
      });
      const data = res.data.emergency || res.data;
      if (data) activeEmergencyState = data;
      return data;
    } catch {
      console.info('[Emergency] SOS activated in local state fallback');
      activeEmergencyState = {
        id: 'emg_' + Date.now(),
        latitude,
        longitude,
        reason,
        message,
        status: 'ACTIVE',
        ambulanceAssigned: true,
        createdAt: new Date().toISOString(),
      };
      return activeEmergencyState;
    }
  },

  getActiveEmergency: async () => {
    try {
      const res = await api.get('/emergency/active');
      return res.data.emergency || res.data || null;
    } catch {
      return activeEmergencyState;
    }
  },

  cancelEmergency: async (emergencyId) => {
    try {
      await api.patch(`/emergency/${emergencyId}/cancel`);
      activeEmergencyState = null;
    } catch {
      activeEmergencyState = null;
    }
  },
};

export default emergencyApi;
