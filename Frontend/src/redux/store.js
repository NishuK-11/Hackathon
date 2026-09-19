import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import opdReducer from './slices/opdSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';
import queueReducer from './slices/queueSlice';
import uiReducer from './slices/uiSlice';
import labReducer from './slices/labSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    opd: opdReducer,
    notification: notificationReducer,
    theme: themeReducer,
    queue: queueReducer,
    ui: uiReducer,
    lab: labReducer,
  },
});

export default store;
