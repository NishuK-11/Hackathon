import { createSlice } from '@reduxjs/toolkit';

const savedLang = localStorage.getItem('patient_lang') || 'en';

const initialState = {
  language: savedLang,
  isEmergencyModalOpen: false,
  isUploadReportModalOpen: false,
  toast: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('patient_lang', action.payload);
    },
    setEmergencyModalOpen: (state, action) => {
      state.isEmergencyModalOpen = action.payload;
    },
    setUploadReportModalOpen: (state, action) => {
      state.isUploadReportModalOpen = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'success',
        id: Date.now(),
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  setLanguage,
  setEmergencyModalOpen,
  setUploadReportModalOpen,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
