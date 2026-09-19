import { createSlice } from '@reduxjs/toolkit';

const mockActiveQueue = {
  hospitalName: 'Apollo Spectra Multi-Speciality',
  departmentName: 'Cardiology',
  doctorName: 'Dr. Rajesh Sharma',
  yourToken: 14,
  currentToken: 11,
  estimatedWaitMins: 18,
  roomNumber: 'Cabin 204, 2nd Floor',
  isPaused: false,
  isOpdClosed: false,
  notification: "The OPD is ongoing. 3 patients ahead of you.",
  patientsAhead: 3,
};

const initialState = {
  queue: null,
  isLoading: false,
  incomingCall: null,
  isCallActive: false,
};

export const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setQueueLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
      state.isLoading = false;
    },
    updateCurrentToken: (state, action) => {
      if (!state.queue) return;
      const newToken = action.payload;
      state.queue.currentToken = newToken;
      state.queue.isPaused = false;
      state.queue.isOpdClosed = false;

      if (state.queue.yourToken) {
        state.queue.patientsAhead = Math.max(0, state.queue.yourToken - newToken);
        if (state.queue.yourToken === newToken) {
          state.queue.notification = "It's your turn! Please proceed to the doctor's cabin.";
        } else if (newToken > state.queue.yourToken) {
          state.queue.notification = "Your turn is done. Consultation completed.";
        } else {
          state.queue.notification = `The OPD is ongoing. ${state.queue.patientsAhead} patient(s) ahead.`;
        }
      }
    },
    pauseQueue: (state) => {
      if (!state.queue) return;
      state.queue.isPaused = true;
      state.queue.notification = "The OPD has been paused by the doctor.";
    },
    resumeQueue: (state, action) => {
      if (!state.queue) return;
      if (action.payload !== undefined) {
        state.queue.currentToken = action.payload;
      }
      state.queue.isPaused = false;
      state.queue.notification = "The OPD has resumed.";
    },
    stopQueue: (state) => {
      if (!state.queue) return;
      state.queue.isPaused = false;
      state.queue.isOpdClosed = true;
      state.queue.notification = "The OPD has ended for today.";
    },
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    setCallActive: (state, action) => {
      state.isCallActive = action.payload;
      if (action.payload) {
        state.incomingCall = null;
      }
    },
  },
});

export const {
  setQueueLoading,
  setQueue,
  updateCurrentToken,
  pauseQueue,
  resumeQueue,
  stopQueue,
  setIncomingCall,
  setCallActive,
} = queueSlice.actions;

export default queueSlice.reducer;
