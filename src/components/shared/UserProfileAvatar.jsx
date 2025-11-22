import { useState } from 'react';
import { Users } from 'lucide-react';
import { useGetMeQuery } from '../../api/auth/authApi';
import UserProfileModal from './UserProfileModal';

const UserProfileAvatar = ({ size = 'default' }) => {
  const [showModal, setShowModal] = useState(false);
  const { data: userResponse, isLoading, error } = useGetMeQuery();
  
  // Extract user data from API response
  const userData = userResponse?.data;
  
  // Size configurations
  const sizeConfig = {
    small: {
      avatar: 'w-8 h-8',
      icon: 16,
      nameText: 'text-sm',
      roleText: 'text-xs'
    },
    default: {
      avatar: 'w-12 h-12',
      icon: 24,
      nameText: 'text-base',
      roleText: 'text-sm'
    },
    large: {
      avatar: 'w-16 h-16',
      icon: 32,
      nameText: 'text-lg',
      roleText: 'text-base'
    }
  };
  
  const config = sizeConfig[size] || sizeConfig.default;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className={`${config.avatar} rounded-full bg-gray-200 animate-pulse flex items-center justify-center`}>
          <Users size={config.icon} className="text-gray-400" />
        </div>
        <div>
          <div className={`h-4 bg-gray-200 rounded animate-pulse mb-1`} style={{ width: '80px' }}></div>
          <div className={`h-3 bg-gray-200 rounded animate-pulse`} style={{ width: '60px' }}></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-3">
        <div className={`${config.avatar} rounded-full bg-red-100 flex items-center justify-center`}>
          <Users size={config.icon} className="text-red-500" />
        </div>
        <div>
          <p className={`font-medium text-gray-900 ${config.nameText}`}>Lỗi tải dữ liệu</p>
          <p className={`text-gray-500 ${config.roleText}`}>Không thể kết nối</p>
        </div>
      </div>
    );
  }
  
  // Default fallback values
  const displayName = userData?.fullName || 'Người dùng';
  const displayRole = userData?.roleName || 'Chưa xác định';
  const displayStore = userData?.storeName || '';
  
  // Generate avatar background color based on user name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  const avatarColor = getAvatarColor(displayName);
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <>
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
        onClick={() => setShowModal(true)}
        title="Xem thông tin cá nhân"
      >
        <div className={`${config.avatar} rounded-full ${avatarColor} flex items-center justify-center font-semibold`}>
          {initials || <Users size={config.icon} />}
        </div>
        <div>
          <p className={`font-medium text-gray-900 ${config.nameText} truncate max-w-32`}>
            {displayName}
          </p>
          <p className={`text-gray-500 ${config.roleText} truncate max-w-32`}>
            {displayRole}
          </p>
          {displayStore && (
            <p className={`text-gray-400 ${config.roleText} truncate max-w-32`}>
              {displayStore}
            </p>
          )}
        </div>
      </div>
      
      {showModal && (
        <UserProfileModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userData={userData}
        />
      )}
    </>
  );
};

export default UserProfileAvatar;
