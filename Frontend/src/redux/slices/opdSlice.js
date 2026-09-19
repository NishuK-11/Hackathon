import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  opdStarted: false,
  opdPaused: false,
  currentAppointment: null,
  appointments: [],
};

const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    setOpdStarted: (state, action) => { state.opdStarted = action.payload; },
    setOpdPaused: (state, action) => { state.opdPaused = action.payload; },
    setCurrentAppointment: (state, action) => { state.currentAppointment = action.payload; },
    setAppointments: (state, action) => { state.appointments = action.payload; },
    resetOpd: (state) => {
      state.opdStarted = false;
      state.opdPaused = false;
      state.currentAppointment = null;
      state.appointments = [];
    },
  },
});

export const {
  setOpdStarted,
  setOpdPaused,
  setCurrentAppointment,
  setAppointments,
  resetOpd,
} = opdSlice.actions;

export default opdSlice.reducer;
