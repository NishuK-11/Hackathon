import api from './axiosInstance';
import { mockReports } from './mockData';

let storedReports = [...mockReports];

export const reportApi = {
  fetchMyReports: async () => {
    try {
      const res = await api.get('/patients/get-my-reports');
      return res.data.reports.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        file: r.filePublicId || '',
        fileType: r.fileType === 'image' ? 'image' : 'pdf',
        createdAt: r.uploadedAt,
      }));
    } catch {
      return storedReports;
    }
  },

  uploadReport: async (formData) => {
    try {
      await api.post('/reports/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, message: 'Report uploaded successfully' };
    } catch {
      console.info('[Report] Saved report in mock store fallback');
      const title = formData.get('title') || 'Medical Document';
      const type = formData.get('type') || 'General';
      const file = formData.get('file');
      const fileType = file && file.type && file.type.includes('image') ? 'image' : 'pdf';
      const mockFileUrl = file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&fit=crop';

      storedReports.unshift({
        id: 'rep_' + Date.now(),
        title,
        type,
        file: mockFileUrl,
        fileType,
        createdAt: new Date().toISOString(),
      });

      return { success: true, message: 'Report uploaded successfully (Saved locally)' };
    }
  },
};

export default reportApi;
