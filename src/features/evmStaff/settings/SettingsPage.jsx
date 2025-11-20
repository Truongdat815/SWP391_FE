import { useState } from 'react';
import { User, Lock, Bell, Globe } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update API
    alert('Cập nhật thông tin thành công!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    // TODO: Implement password change API
    alert('Đổi mật khẩu thành công!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  return (
    <EVMStaffLayout>
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

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Thông báo qua email</p>
                        <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Thông báo đẩy</p>
                        <p className="text-sm text-gray-500">Nhận thông báo đẩy trên trình duyệt</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              pushNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Cập nhật đơn hàng</p>
                        <p className="text-sm text-gray-500">Nhận thông báo khi có cập nhật đơn hàng</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.orderUpdates}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              orderUpdates: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => alert('Đã lưu cài đặt thông báo!')}>Lưu cài đặt</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EVMStaffLayout>
  );
};

export default SettingsPage;

