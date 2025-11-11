import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, hasRole, getDefaultRoute, getUserRole, user } = useAuth();
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

    // Nếu user có status PENDING và không phải đang ở trang change-password, redirect đến trang đổi mật khẩu
    // Chỉ redirect nếu status thực sự là PENDING (không phải ACTIVE hoặc các status khác)
    if (user && user.status) {
        const userStatus = user.status.toUpperCase().trim();
        console.log('ProtectedRoute - user status:', userStatus);
        console.log('ProtectedRoute - current path:', location.pathname);
        
        if (userStatus === 'PENDING' && location.pathname !== '/change-password') {
            console.log('ProtectedRoute - user status is PENDING, redirecting to change password');
            return <Navigate to="/change-password" replace />;
        } else if (userStatus !== 'PENDING' && location.pathname === '/change-password') {
            // Nếu status không phải PENDING nhưng đang ở trang change-password, redirect về trang chính
            console.log('ProtectedRoute - user status is NOT PENDING but on change-password page, redirecting to default route');
            const defaultRoute = getDefaultRoute();
            return <Navigate to={defaultRoute} replace />;
        }
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