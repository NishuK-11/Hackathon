import api from './axiosInstance';

let activeEmergencyState = null;

export const emergencyApi = {
  createEmergency: async (latOrPayload, maybeLng, maybeReason, maybeMessage, maybeHospitalId) => {
    let payload = {};
    if (typeof latOrPayload === 'object' && latOrPayload !== null) {
      payload = {
        hospitalId: latOrPayload.hospitalId,
        latitude: Number(latOrPayload.latitude),
        longitude: Number(latOrPayload.longitude),
        reason: latOrPayload.reason || 'OTHER',
        message: latOrPayload.message || '',
      };
    } else {
      payload = {
        latitude: Number(latOrPayload),
        longitude: Number(maybeLng),
        reason: maybeReason || 'OTHER',
        message: maybeMessage || '',
        hospitalId: maybeHospitalId,
      };
    }

    try {
      const res = await api.post('/emergency', payload);
      const data = res.data.emergency || res.data;
      if (data) activeEmergencyState = data;
      return data;
    } catch (err) {
      console.warn('[Emergency] Backend SOS error:', err?.response?.data || err.message);
      activeEmergencyState = {
        _id: 'emg_' + Date.now(),
        id: 'emg_' + Date.now(),
        latitude: payload.latitude,
        longitude: payload.longitude,
        reason: payload.reason,
        message: payload.message,
        status: 'REQUESTED',
        ambulanceAssigned: false,
        createdAt: new Date().toISOString(),
      };
      return activeEmergencyState;
    }
  },

  getActiveEmergency: async () => {
    try {
      const res = await api.get('/emergency/my/active');
      const data = res.data.emergency || null;
      activeEmergencyState = data;
      return data;
    } catch (err) {
      console.warn('[Emergency] Get active error:', err?.response?.data || err.message);
      return activeEmergencyState;
    }
  },

  cancelEmergency: async (emergencyId) => {
    try {
      const id = emergencyId || activeEmergencyState?._id || activeEmergencyState?.id;
      if (!id) return;
      await api.patch(`/emergency/${id}/cancel`);
      activeEmergencyState = null;
    } catch (err) {
      console.warn('[Emergency] Cancel error:', err?.response?.data || err.message);
      activeEmergencyState = null;
    }
  },
};

export default emergencyApi;
