import React from 'react';
import './App.css';
import AppRoutes from './Routes/AppRoutes';
import { useThemeSync } from './hooks/useThemeSync';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  useThemeSync();

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        theme="dark"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
