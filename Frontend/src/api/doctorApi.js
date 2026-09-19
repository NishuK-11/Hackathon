import api from './axiosInstance';
import { mockDepartments, mockDoctors } from './mockData';

export const doctorApi = {
  getDepartments: async (hospitalId) => {
    try {
      const res = await api.get(`/departments/hospital/${hospitalId}`);
      return res.data.departments || mockDepartments[hospitalId] || mockDepartments['hosp_01'] || [];
    } catch {
      return mockDepartments[hospitalId] || mockDepartments['hosp_01'] || [];
    }
  },

  getDoctors: async (hospitalId, departmentId) => {
    try {
      const res = await api.get(`/doctors/hospital/${hospitalId}/department/${departmentId}`);
      return res.data.doctors || mockDoctors[departmentId] || mockDoctors['dept_cardio'] || [];
    } catch {
      return mockDoctors[departmentId] || mockDoctors['dept_cardio'] || [];
    }
  },
};

export default doctorApi;
