import React, { useState } from 'react';

const DealerStaffProfile = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: 'Staff Name',
    email: 'staff@electra.com',
    phone: '0901234567',
    role: 'Nhân viên bán hàng',
    employeeId: 'DS001',
    department: 'Phòng bán hàng',
    startDate: '2023-03-15',
    dealer: 'Đại lý Hà Nội',
    manager: 'Nguyễn Văn Manager'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Xử lý lưu thông tin
    alert('Thông tin đã được cập nhật thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      )}
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-white shadow">
            <span className="text-emerald-600 font-bold text-xl">DS</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600">Quản lý hồ sơ nhân viên bán hàng</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
            <input 
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 bg-white text-gray-900 bg-white text-gray-900" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <input 
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 bg-white text-gray-900 bg-white text-gray-900" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đại lý</label>
            <input 
              name="dealer"
              value={formData.dealer}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 bg-white text-gray-900 bg-white text-gray-900" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quản lý trực tiếp</label>
            <input 
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 bg-white text-gray-900 bg-white text-gray-900" 
              disabled 
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
            <input 
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900 bg-white text-gray-900" 
            />
          </div>
        </div>

        {/* Thành tích bán hàng */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành tích bán hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">15</div>
              <div className="text-sm text-gray-600">Đơn hàng tháng này</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.1M VNĐ</div>
              <div className="text-sm text-gray-600">Doanh số tháng</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <div className="text-sm text-gray-600">Tỷ lệ chuyển đổi</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">4.8</div>
              <div className="text-sm text-gray-600">Đánh giá trung bình</div>
            </div>
          </div>
        </div>

        {/* Quyền hạn */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn và nhiệm vụ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Tạo báo giá</span>
            </div>
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Xem đơn hàng</span>
            </div>
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Lịch hẹn lái thử</span>
            </div>
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <svg className="h-5 w-5 text-emerald-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Quản lý thanh toán</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Lần cập nhật gần nhất: hôm nay</p>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition shadow-sm bg-white text-gray-900"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealerStaffProfile;
