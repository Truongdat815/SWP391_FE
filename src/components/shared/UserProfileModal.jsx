import { X, User, Mail, Phone, Building, Shield, Calendar, CheckCircle } from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không hợp lệ';
    }
  };
  
  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} ngày trước`;
      } else if (diffHours > 0) {
        return `${diffHours} giờ trước`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} phút trước`;
      } else {
        return 'Vừa xong';
      }
    } catch (error) {
      return 'Không hợp lệ';
    }
  };
  
  // Status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'hoạt động':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'không hoạt động':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'chờ duyệt':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Generate avatar initials and color
  const displayName = userData?.fullName || 'Người dùng';
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  const avatarColor = getAvatarColor(displayName);
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 overflow-hidden">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
              {initials || <User size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {userData?.fullName || 'Không có tên'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData?.status)}`}>
                  {userData?.status || 'Không xác định'}
                </span>
                
              </div>
            </div>
          </div>
          
          {/* Detailed Information - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-gray-900 truncate">{userData?.email || 'Chưa có email'}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={18} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Điện thoại</p>
                <p className="text-sm text-gray-900 truncate">{userData?.phone || 'Chưa có số điện thoại'}</p>
              </div>
            </div>
            
            {/* Role */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield size={18} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vai trò</p>
                <p className="text-sm text-gray-900 truncate">
                  {userData?.roleName || 'Chưa xác định'}
                </p>
              </div>
            </div>
            
            {/* Store */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building size={18} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cửa hàng</p>
                <p className="text-sm text-gray-900 truncate">
                  {userData?.storeName || 'Chưa có cửa hàng'}
                </p>
              </div>
            </div>
            
            {/* Created Date */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
              <Calendar size={18} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngày tạo tài khoản</p>
                <p className="text-sm text-gray-900">{formatDate(userData?.createdAt)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          {userData && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <CheckCircle size={16} className="text-green-500" />
                <span>Thông tin được cập nhật từ hệ thống</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
