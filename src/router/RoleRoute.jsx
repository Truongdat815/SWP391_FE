import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const userRole = useAppSelector((state) => state.auth.role);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = userRole.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;

