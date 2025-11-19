import { Bell, User } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Tổng quan</h2>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.roleName || 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

