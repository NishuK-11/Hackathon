import api from './axiosInstance';
import { mockHospitals, mockReviews } from './mockData';

export const hospitalApi = {
  getStates: async () => {
    try {
      const res = await api.get('/hospitals/states');
      return ['All', ...(res.data.data || res.data)];
    } catch {
      return ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat'];
    }
  },

  getCities: async (state) => {
    try {
      const res = await api.get(`/hospitals/cities?state=${encodeURIComponent(state)}`);
      return ['All', ...(res.data.data || res.data)];
    } catch {
      if (state === 'Maharashtra') return ['All', 'Pune', 'Mumbai', 'Nagpur'];
      return ['All', 'Pune', 'Mumbai', 'Bangalore', 'Delhi'];
    }
  },

  getHospitals: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.state && params.state !== 'All') query.append('state', params.state);
      if (params.city && params.city !== 'All') query.append('city', params.city);
      if (params.lat && params.lng) {
        query.append('lat', params.lat.toString());
        query.append('lng', params.lng.toString());
        query.append('radius', (params.radius || 5).toString());
      }
      if (params.emergency) query.append('emergency', 'true');

      const url = `/hospitals${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await api.get(url);
      return res.data.data || res.data;
    } catch {
      let filtered = [...mockHospitals];
      if (params.state && params.state !== 'All') {
        filtered = filtered.filter((h) => h.state.toLowerCase() === params.state?.toLowerCase());
      }
      if (params.city && params.city !== 'All') {
        filtered = filtered.filter((h) => h.city.toLowerCase() === params.city?.toLowerCase());
      }
      return filtered;
    }
  },

  getHospitalProfile: async (hospitalId) => {
    try {
      const res = await api.get(`/hospitals/profile/${hospitalId}`);
      return res.data.data || res.data;
    } catch {
      const found = mockHospitals.find((h) => h.id === hospitalId);
      if (!found) return mockHospitals[0];
      return found;
    }
  },

  getReviews: async (hospitalId) => {
    try {
      const res = await api.get(`/hospital/${hospitalId}/review`);
      return res.data;
    } catch {
      const reviews = mockReviews[hospitalId] || mockReviews['hosp_01'] || [];
      const userReview = reviews.find((r) => r.isMine) || null;
      const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;
      return {
        success: true,
        totalReviews: reviews.length,
        averageRating: Number(avg.toFixed(1)),
        reviews,
        userReview,
      };
    }
  },

  addReview: async (hospitalId, rating, feedback) => {
    try {
      const res = await api.post(`/hospital/${hospitalId}/review`, { rating, feedback });
      return res.data;
    } catch {
      if (!mockReviews[hospitalId]) mockReviews[hospitalId] = [];
      mockReviews[hospitalId].unshift({
        id: 'rev_' + Date.now(),
        patientName: 'Sweta Sharma',
        rating,
        feedback,
        createdAt: new Date().toISOString(),
        isMine: true,
      });
    }
  },

  editReview: async (hospitalId, rating, feedback) => {
    try {
      const res = await api.put(`/hospital/${hospitalId}/review`, { rating, feedback });
      return res.data;
    } catch (err) {
      if (mockReviews[hospitalId]) {
        const found = mockReviews[hospitalId].find((r) => r.isMine);
        if (found) {
          found.rating = rating;
          found.feedback = feedback;
        }
      }
    }
  },

  getRouteToHospital: async (patientLat, patientLng, hospitalId) => {
    try {
      const res = await api.post('/route-to-hospital', { patientLat, patientLng, hospitalId });
      if (res.data?.routeGeoJSON?.features?.[0]?.geometry?.coordinates) {
        return res.data.routeGeoJSON.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      }
      return [
        [patientLat || 18.5204, patientLng || 73.8567],
        [18.5314, 73.8298],
      ];
    } catch {
      return [
        [patientLat || 18.5204, patientLng || 73.8567],
        [(patientLat || 18.5204) + 0.005, (patientLng || 73.8567) + 0.004],
        [(patientLat || 18.5204) + 0.012, (patientLng || 73.8567) + 0.01],
        [18.5314, 73.8298],
      ];
    }
  },
};

export default hospitalApi;
