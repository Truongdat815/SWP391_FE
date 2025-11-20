import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { normalizeRole, getRoleDashboardRoute } from '../utils/roleUtils';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const userRole = useAppSelector((state) => state.auth.role);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedRole)) {
    // Redirect to user's dashboard if they don't have permission
    const userDashboard = getRoleDashboardRoute(userRole);
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default RoleRoute;

