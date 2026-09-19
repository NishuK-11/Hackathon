import api from './axiosInstance';
import { mockActiveQueue } from './mockData';

export const queueApi = {
  getActiveQueue: async () => {
    try {
      const res = await api.get('/patients/active-queue-status');
      return res.data;
    } catch {
      return mockActiveQueue;
    }
  },
};

export default queueApi;
