import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, hasRole, getDefaultRoute, getUserRole } = useAuth();
    const location = useLocation();

    // Debug logs
    console.log('ProtectedRoute - requiredRole:', requiredRole);
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('ProtectedRoute - current path:', location.pathname);
    
    if (isAuthenticated) {
        const userRole = getUserRole();
        console.log('ProtectedRoute - userRole:', userRole);
        console.log('ProtectedRoute - hasRole:', hasRole(requiredRole));
    }

    // If not authenticated, redirect to signin
    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // If role is required and user doesn't have it, redirect to default route
    if (requiredRole && !hasRole(requiredRole)) {
        const defaultRoute = getDefaultRoute();
        console.log('ProtectedRoute - redirecting to:', defaultRoute);
        return <Navigate to={defaultRoute} replace />;
    }

    return children;
};

export default ProtectedRoute;