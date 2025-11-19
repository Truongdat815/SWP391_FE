import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

