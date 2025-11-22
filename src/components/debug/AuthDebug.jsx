import { useAppSelector } from '../../hooks/useAppSelector';
import { getAuthFromStorage, getRoleFromPath } from '../../utils/roleUtils';
import { useLocation } from 'react-router-dom';

const AuthDebug = () => {
  const auth = useAppSelector((state) => state.auth);
  const location = useLocation();
  const roleFromPath = getRoleFromPath(location.pathname);
  const authFromStorage = roleFromPath ? getAuthFromStorage(roleFromPath) : null;

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Path: {location.pathname}</div>
        <div>Role from path: {roleFromPath || 'null'}</div>
        <div>Redux isAuth: {auth.isAuthenticated ? 'true' : 'false'}</div>
        <div>Redux role: {auth.role || 'null'}</div>
        <div>Redux token: {auth.token ? 'exists' : 'null'}</div>
        <div>Storage token: {authFromStorage?.token ? 'exists' : 'null'}</div>
        <div>Storage role: {authFromStorage?.role || 'null'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
