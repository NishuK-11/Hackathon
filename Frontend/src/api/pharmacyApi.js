import api from './axiosInstance';
import { mockPharmacies, mockMedicines } from './mockData';

export const pharmacyApi = {
  getAvailablePharmacies: async () => {
    try {
      const res = await api.get('/pharmacy/available');
      return res.data.pharmacies || mockPharmacies;
    } catch {
      return mockPharmacies;
    }
  },

  getMedicinesByPharmacy: async (pharmacyId) => {
    try {
      const res = await api.get(`/pharmacy/medicine/${pharmacyId}`);
      return res.data.medicines || mockMedicines[pharmacyId] || mockMedicines['pharm_01'] || [];
    } catch {
      return mockMedicines[pharmacyId] || mockMedicines['pharm_01'] || [];
    }
  },
};

export default pharmacyApi;
