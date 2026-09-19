import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLE } from '../constants/Role';
import { useSelector } from 'react-redux';

export const ProtectedRoutes = ({ children, allowedRoles }) => {
  const { token, role, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role.toUpperCase();
  const normalizedAllowed = allowedRoles?.map((r) => r.toUpperCase());

  if (allowedRoles && !normalizedAllowed?.includes(normalizedRole)) {
    if (normalizedRole === ROLE.hospital_admin || normalizedRole === ROLE.admin) {
      return <Navigate to="/hospital-dashboard" replace />;
    }
    if (normalizedRole === ROLE.doctor) {
      return <Navigate to="/doctor-dashboard" replace />;
    }
    if (normalizedRole === ROLE.patient) {
      return <Navigate to="/patient-dashboard" replace />;
    }
    if (normalizedRole === ROLE.pharmacy) {
      return <Navigate to="/pharmacy-dashboard" replace />;
    }
    if (normalizedRole === ROLE.lab || normalizedRole === 'LAB_TECHNICIAN') {
      return <Navigate to="/lab-dashboard" replace />;
    }
    if (normalizedRole === ROLE.platform_admin) {
      return <Navigate to="/platform-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoutes;