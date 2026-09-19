import { Navigate } from "react-router-dom";
import { ROLE } from "../constants/Role";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const {token, role, isAuthenticated } = useSelector((state)=> state.auth)

  if (token && isAuthenticated) {
    switch (role) {
      case ROLE.admin:
        return <Navigate to="/hospital-dashboard" replace />;
      case ROLE.platform_admin:
        return <Navigate to="/platform-dashboard" replace />;
      case ROLE.doctor:
        return <Navigate to="/doctor-dashboard" replace />
      case ROLE.pharmacy:
        return <Navigate to="/pharmacy-dashboard" replace />
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute;