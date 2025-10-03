import { useState } from 'react';

function ContractManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('contracts');

  const contracts = [
    {
      id: 'CT001',
      dealerName: 'Đại lý Hà Nội',
      contractType: 'Đại lý chính thức',
      startDate: '2023-01-15',
      endDate: '2024-01-15',
      target: 100,
      achieved: 156,
      status: 'active',
      commission: '5%',
      contractValue: 8500000000,
      signedDate: '2023-01-10'
    },
    {
      id: 'CT002',
      dealerName: 'Đại lý TP.HCM',
      contractType: 'Đại lý chính thức',
      startDate: '2023-02-20',
      endDate: '2024-02-20',
      target: 150,
      achieved: 234,
      status: 'active',
      commission: '5%',
      contractValue: 12750000000,
      signedDate: '2023-02-15'
    },
    {
      id: 'CT003',
      dealerName: 'Đại lý Đà Nẵng',
      contractType: 'Đại lý phụ',
      startDate: '2023-03-10',
      endDate: '2024-03-10',
      target: 80,
      achieved: 89,
      status: 'active',
      commission: '4%',
      contractValue: 5200000000,
      signedDate: '2023-03-05'
    },
    {
      id: 'CT004',
      dealerName: 'Đại lý Cần Thơ',
      contractType: 'Đại lý phụ',
      startDate: '2023-04-05',
      endDate: '2024-04-05',
      target: 60,
      achieved: 45,
      status: 'pending',
      commission: '4%',
      contractValue: 3900000000,
      signedDate: '2023-04-01'
    }
  ];

  const tabs = [
    { id: 'contracts', name: 'Hợp đồng', icon: '📋' },
    { id: 'targets', name: 'Chỉ tiêu doanh số', icon: '🎯' },
    { id: 'renewals', name: 'Gia hạn', icon: '🔄' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'expired': return 'Hết hạn';
      case 'terminated': return 'Chấm dứt';
      default: return status;
    }
  };

  const getContractTypeColor = (type) => {
    switch (type) {
      case 'Đại lý chính thức': return 'bg-blue-100 text-blue-800';
      case 'Đại lý phụ': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  const getAchievementColor = (achieved, target) => {
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
          <p className="text-gray-600 mt-1">Quản lý hợp đồng, chỉ tiêu doanh số</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-blue-600">+3 tháng này</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">20</p>
              <p className="text-sm text-green-600">83%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-yellow-600">30 ngày</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ đạt chỉ tiêu</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-purple-600">+8%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contracts Management */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách hợp đồng</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Tạo hợp đồng mới
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đại lý
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.dealerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getContractTypeColor(contract.contractType)}`}>
                            {contract.contractType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(contract.contractValue)} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{contract.startDate}</div>
                            <div className="text-xs text-gray-500">đến {contract.endDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-emerald-600 hover:text-emerald-900 mr-3">Xem</button>
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Sửa</button>
                          <button className="text-red-600 hover:text-red-900">Hủy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales Targets */}
          {activeTab === 'targets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Chỉ tiêu doanh số</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Thiết lập chỉ tiêu mới
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {contracts.map((contract) => (
                  <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{contract.dealerName}</h4>
                        <p className="text-sm text-gray-500">Hợp đồng {contract.id}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Chỉ tiêu</p>
                        <p className="text-lg font-bold text-gray-900">{contract.target} xe</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Đã đạt</p>
                        <p className="text-lg font-bold text-gray-900">{contract.achieved} xe</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAchievementColor(contract.achieved, contract.target)}`}>
                          {Math.round((contract.achieved / contract.target) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((contract.achieved / contract.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Hoa hồng: {contract.commission}</span>
                      <span>Còn lại: {Math.max(contract.target - contract.achieved, 0)} xe</span>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition">
                        Cập nhật tiến độ
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Setting Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Thiết lập chỉ tiêu cho đại lý</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đại lý</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Chọn đại lý</option>
                      <option>Đại lý Hà Nội</option>
                      <option>Đại lý TP.HCM</option>
                      <option>Đại lý Đà Nẵng</option>
                      <option>Đại lý Cần Thơ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chỉ tiêu (xe)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hoa hồng (%)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>1 năm</option>
                      <option>6 tháng</option>
                      <option>3 tháng</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Thiết lập chỉ tiêu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contract Renewals */}
          {activeTab === 'renewals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gia hạn hợp đồng</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Tạo yêu cầu gia hạn
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Hợp đồng sắp hết hạn</h4>
                  <div className="space-y-3">
                    {contracts
                      .filter(contract => {
                        const endDate = new Date(contract.endDate);
                        const today = new Date();
                        const diffTime = endDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30 && diffDays > 0;
                      })
                      .map((contract) => (
                        <div key={contract.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{contract.dealerName}</h5>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Hết hạn trong 15 ngày
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Hợp đồng {contract.id} - {contract.contractType}</p>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded text-sm hover:bg-emerald-700 transition">
                              Gia hạn ngay
                            </button>
                            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition">
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Lịch sử gia hạn</h4>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">Đại lý Hà Nội</h5>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Đã gia hạn
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">CT001 - Gia hạn 1 năm (2024-01-15)</p>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">Đại lý TP.HCM</h5>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Đã gia hạn
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">CT002 - Gia hạn 1 năm (2024-02-20)</p>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">Đại lý Đà Nẵng</h5>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Đang xử lý
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">CT003 - Yêu cầu gia hạn 6 tháng</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Request Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Tạo yêu cầu gia hạn hợp đồng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hợp đồng</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Chọn hợp đồng</option>
                      <option>CT001 - Đại lý Hà Nội</option>
                      <option>CT002 - Đại lý TP.HCM</option>
                      <option>CT003 - Đại lý Đà Nẵng</option>
                      <option>CT004 - Đại lý Cần Thơ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gia hạn</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>1 năm</option>
                      <option>6 tháng</option>
                      <option>3 tháng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chỉ tiêu mới</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hoa hồng mới (%)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="5" />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Tạo yêu cầu gia hạn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractManagement;