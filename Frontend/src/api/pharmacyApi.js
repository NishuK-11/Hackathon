import api from './axiosInstance';
import { mockPharmacies, mockMedicines } from './mockData';

export const pharmacyApi = {
  getAvailablePharmacies: async (lat, lng) => {
    try {
      if (lat && lng) {
        const res = await api.get(`/pharmacy/nearby?lat=${lat}&lng=${lng}`);
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      }
      const resAll = await api.get('/pharmacies');
      if (resAll.data?.pharmacies) {
        return resAll.data.pharmacies;
      }
      return mockPharmacies;
    } catch {
      try {
        const resFallback = await api.get('/pharmacies');
        return resFallback.data?.pharmacies || mockPharmacies;
      } catch {
        return mockPharmacies;
      }
    }
  },

  getMedicinesByPharmacy: async (pharmacyId) => {
    try {
      const res = await api.get(`/pharmacy/${pharmacyId}/medicines`);
      return res.data?.data || res.data?.medicines || mockMedicines[pharmacyId] || mockMedicines['pharm_01'] || [];
    } catch {
      return mockMedicines[pharmacyId] || mockMedicines['pharm_01'] || [];
    }
  },
};

export default pharmacyApi;
