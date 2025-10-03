import { useState } from 'react';

function UserManagement() {
  const [activeTab, setActiveTab] = useState('evm-staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const evmStaff = [
    {
      id: 'EVS001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@electra.com',
      department: 'Sản xuất',
      role: 'Quản lý sản phẩm',
      status: 'active',
      lastLogin: '2024-01-15 09:30',
      createdAt: '2023-06-15'
    },
    {
      id: 'EVS002',
      name: 'Trần Thị B',
      email: 'tranthib@electra.com',
      department: 'Kho hàng',
      role: 'Quản lý tồn kho',
      status: 'active',
      lastLogin: '2024-01-15 08:45',
      createdAt: '2023-07-20'
    },
    {
      id: 'EVS003',
      name: 'Lê Văn C',
      email: 'levanc@electra.com',
      department: 'Giá cả',
      role: 'Quản lý giá',
      status: 'inactive',
      lastLogin: '2024-01-10 14:20',
      createdAt: '2023-08-10'
    }
  ];

  const dealerAccounts = [
    {
      id: 'DEA001',
      name: 'Đại lý Hà Nội',
      email: 'hanoi@electra.com',
      manager: 'Phạm Văn D',
      location: 'Hà Nội',
      status: 'active',
      lastLogin: '2024-01-15 10:15',
      createdAt: '2023-05-20'
    },
    {
      id: 'DEA002',
      name: 'Đại lý TP.HCM',
      email: 'hcm@electra.com',
      manager: 'Nguyễn Thị E',
      location: 'TP.HCM',
      status: 'active',
      lastLogin: '2024-01-15 11:30',
      createdAt: '2023-05-25'
    },
    {
      id: 'DEA003',
      name: 'Đại lý Đà Nẵng',
      email: 'danang@electra.com',
      manager: 'Trần Văn F',
      location: 'Đà Nẵng',
      status: 'pending',
      lastLogin: '2024-01-12 16:45',
      createdAt: '2023-09-15'
    }
  ];

  const roles = [
    {
      id: 'ADMIN',
      name: 'Administrator',
      description: 'Quyền truy cập đầy đủ hệ thống',
      permissions: ['user_management', 'system_config', 'monitoring', 'dealer_management'],
      userCount: 1
    },
    {
      id: 'EVM_MANAGER',
      name: 'EVM Manager',
      description: 'Quản lý nhân viên EVM và sản phẩm',
      permissions: ['product_management', 'inventory_management', 'pricing_management'],
      userCount: 5
    },
    {
      id: 'EVM_STAFF',
      name: 'EVM Staff',
      description: 'Nhân viên EVM thông thường',
      permissions: ['product_view', 'inventory_view', 'report_view'],
      userCount: 15
    },
    {
      id: 'DEALER_MANAGER',
      name: 'Dealer Manager',
      description: 'Quản lý đại lý',
      permissions: ['dealer_management', 'sales_report', 'staff_management'],
      userCount: 8
    },
    {
      id: 'DEALER_STAFF',
      name: 'Dealer Staff',
      description: 'Nhân viên đại lý',
      permissions: ['customer_management', 'quote_creation', 'order_management'],
      userCount: 25
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const tabs = [
    { id: 'evm-staff', name: 'EVM Staff', count: evmStaff.length },
    { id: 'dealers', name: 'Tài khoản Dealer', count: dealerAccounts.length },
    { id: 'roles', name: 'Vai trò & Quyền', count: roles.length }
  ];

  const renderEVMStaffTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nhân viên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phòng ban
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đăng nhập cuối
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {evmStaff.map((staff) => (
            <tr key={staff.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 font-semibold text-sm">
                      {staff.name.split(' ').pop().charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                    <div className="text-sm text-gray-500">{staff.email}</div>
                    <div className="text-xs text-gray-400">ID: {staff.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {staff.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {staff.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(staff.status)}`}>
                  {getStatusText(staff.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {staff.lastLogin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button className="text-red-600 hover:text-red-900">Chỉnh sửa</button>
                <button className="text-blue-600 hover:text-blue-900">Reset mật khẩu</button>
                <button className="text-gray-600 hover:text-gray-900">Tạm khóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDealerTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đại lý
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quản lý
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Địa điểm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đăng nhập cuối
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dealerAccounts.map((dealer) => (
            <tr key={dealer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold text-sm">
                      {dealer.name.split(' ')[1]?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                    <div className="text-sm text-gray-500">{dealer.email}</div>
                    <div className="text-xs text-gray-400">ID: {dealer.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dealer.manager}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dealer.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dealer.status)}`}>
                  {getStatusText(dealer.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dealer.lastLogin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button className="text-red-600 hover:text-red-900">Chỉnh sửa</button>
                <button className="text-blue-600 hover:text-blue-900">Reset mật khẩu</button>
                <button className="text-green-600 hover:text-green-900">Duyệt</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRolesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quyền hạn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số người dùng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold text-sm">
                      {role.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    <div className="text-xs text-gray-400">ID: {role.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {role.description}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 2).map((permission) => (
                    <span key={permission} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                  {role.permissions.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{role.permissions.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{role.userCount}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button className="text-red-600 hover:text-red-900">Chỉnh sửa</button>
                <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                <button className="text-gray-600 hover:text-gray-900">Sao chép</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng & phân quyền</h1>
            <p className="text-gray-600 mt-1">Quản lý tài khoản, vai trò và quyền hạn trong hệ thống</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm người dùng
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
              <option>Chờ duyệt</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
              <option>Tất cả vai trò</option>
              <option>Administrator</option>
              <option>EVM Manager</option>
              <option>EVM Staff</option>
              <option>Dealer Manager</option>
              <option>Dealer Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'evm-staff' && renderEVMStaffTable()}
          {activeTab === 'dealers' && renderDealerTable()}
          {activeTab === 'roles' && renderRolesTable()}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Thêm người dùng mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài khoản</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                    <option>EVM Staff</option>
                    <option>Dealer Account</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Nhập họ tên"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                    <option>Chọn vai trò</option>
                    <option>EVM Manager</option>
                    <option>EVM Staff</option>
                    <option>Dealer Manager</option>
                    <option>Dealer Staff</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Tạo tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
