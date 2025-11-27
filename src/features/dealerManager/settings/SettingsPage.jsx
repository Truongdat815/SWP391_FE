import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Toast from '../../../components/shared/Toast';
import { useGetMeQuery } from '../../../api/auth/authApi';
import { useToast } from '../../../hooks/useToast';

const SettingsPage = () => {
  const { toasts, showToast, removeToast } = useToast();
  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const userData = userResponse?.data;
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  // Load user data vào form
  useEffect(() => {
    if (userData) {
      setProfileData({
        fullName: userData.fullName || userData.name || userData.username || '',
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || '',
      });
    }
  }, [userData]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!profileData.fullName?.trim()) {
      showToast('Vui lòng nhập họ và tên', 'error');
      return;
    }
    
    if (!profileData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      showToast('Email không hợp lệ', 'error');
      return;
    }
    
    if (!profileData.phone || !/^[0-9]{10,11}$/.test(profileData.phone.replace(/\s/g, ''))) {
      showToast('Số điện thoại phải có 10-11 chữ số', 'error');
      return;
    }
    
    // TODO: Implement profile update API
    showToast('Cập nhật thông tin thành công!', 'success');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu mới không khớp!', 'error');
      return;
    }
    
    // TODO: Implement password change API
    showToast('Đổi mật khẩu thành công!', 'success');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
  ];

  return (
    <DealerManagerLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài Đặt</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản và cài đặt của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                  <div className="space-y-4">
                    <Input
                      label="Họ và tên"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, fullName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Số điện thoại"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Lưu thay đổi</Button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
                  <div className="space-y-4">
                    <Input
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Mật khẩu mới"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Đổi mật khẩu</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </DealerManagerLayout>
  );
};

export default SettingsPage;

