import { useState } from 'react';

function DealerManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('dealers');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [dealers, setDealers] = useState([
    {
      id: 1,
      name: 'Đại lý Hà Nội',
      location: 'Hà Nội',
      contact: 'Nguyễn Văn A',
      phone: '0123 456 789',
      email: 'hanoi@electra.com',
      establishedDate: '2023-01-15',
      status: 'active',
      orders: 156,
      revenue: '8.5M',
      performance: 'excellent',
      contractStatus: 'active'
    },
    {
      id: 2,
      name: 'Đại lý TP.HCM',
      location: 'TP.HCM',
      contact: 'Trần Thị B',
      phone: '0987 654 321',
      email: 'hcm@electra.com',
      establishedDate: '2023-02-20',
      status: 'active',
      orders: 234,
      revenue: '12.3M',
      performance: 'excellent',
      contractStatus: 'active'
    },
    {
      id: 3,
      name: 'Đại lý Đà Nẵng',
      location: 'Đà Nẵng',
      contact: 'Lê Văn C',
      phone: '0456 789 123',
      email: 'danang@electra.com',
      establishedDate: '2023-03-10',
      status: 'warning',
      orders: 89,
      revenue: '4.2M',
      performance: 'good',
      contractStatus: 'active'
    },
    {
      id: 4,
      name: 'Đại lý Cần Thơ',
      location: 'Cần Thơ',
      contact: 'Phạm Thị D',
      phone: '0789 123 456',
      email: 'cantho@electra.com',
      establishedDate: '2023-04-05',
      status: 'active',
      orders: 67,
      revenue: '3.1M',
      performance: 'average',
      contractStatus: 'pending'
    }
  ]);

  const [newDealer, setNewDealer] = useState({
    name: '',
    location: '',
    contact: '',
    phone: '',
    email: '',
    establishedDate: '',
    status: 'active',
    orders: 0,
    revenue: '0',
    performance: 'good',
    contractStatus: 'pending'
  });

  const openAddModal = () => {
    setNewDealer({
      name: '', location: '', contact: '', phone: '', email: '', establishedDate: '',
      status: 'active', orders: 0, revenue: '0', performance: 'good', contractStatus: 'pending'
    })
    setIsAddOpen(true)
  }

  const handleCreateDealer = (e) => {
    e.preventDefault()
    const created = {
      id: Date.now(),
      ...newDealer
    }
    setDealers(prev => [created, ...prev])
    setIsAddOpen(false)
    setSuccessMsg('Đã thêm đại lý mới')
    setTimeout(() => setSuccessMsg(''), 2000)
  }

  const [selectedDealer, setSelectedDealer] = useState(null);
  const [editDealer, setEditDealer] = useState(null);

  const openDetail = (dealer) => {
    setSelectedDealer(dealer);
    setIsDetailOpen(true);
  };

  const openEdit = (dealer) => {
    setEditDealer({ ...dealer });
    setIsEditOpen(true);
  };

  const handleUpdateDealer = (e) => {
    e.preventDefault();
    setDealers(prev => prev.map(d => d.id === editDealer.id ? { ...editDealer } : d));
    setIsEditOpen(false);
    setSuccessMsg('Đã cập nhật thông tin đại lý');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

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
      commission: '5%'
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
      commission: '5%'
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
      commission: '4%'
    }
  ];

  const tabs = [
    { id: 'dealers', name: 'Quản lý đại lý', icon: '🏢' },
    { id: 'contracts', name: 'Hợp đồng & chỉ tiêu', icon: '📋' },
    { id: 'debt', name: 'Công nợ', icon: '💰' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warning': return 'Cảnh báo';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceText = (performance) => {
    switch (performance) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Tốt';
      case 'average': return 'Trung bình';
      case 'poor': return 'Kém';
      default: return performance;
    }
  };

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đại lý</h1>
          <p className="text-gray-600 mt-1">Quản lý hợp đồng, chỉ tiêu doanh số, công nợ</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đại lý</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600">+2 tháng này</p>
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
              <p className="text-2xl font-bold text-gray-900">22</p>
              <p className="text-sm text-green-600">92%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh số</p>
              <p className="text-2xl font-bold text-gray-900">28.1M</p>
              <p className="text-sm text-green-600">+15%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Công nợ tổng</p>
              <p className="text-2xl font-bold text-gray-900">2.3M</p>
              <p className="text-sm text-red-600">-5%</p>
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
          {/* Dealers Management */}
          {activeTab === 'dealers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách đại lý</h3>
                <button onClick={openAddModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Thêm đại lý mới
                </button>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
                  {successMsg}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dealers.map((dealer) => (
                  <div key={dealer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{dealer.name}</h4>
                          <p className="text-sm text-gray-500">{dealer.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dealer.status)}`}>
                          {getStatusText(dealer.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(dealer.performance)}`}>
                          {getPerformanceText(dealer.performance)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Liên hệ: {dealer.contact}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {dealer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {dealer.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{dealer.orders}</p>
                        <p className="text-sm text-gray-500">Đơn hàng</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{dealer.revenue}</p>
                        <p className="text-sm text-gray-500">Doanh thu</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button onClick={() => openDetail(dealer)} className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition">
                        Xem chi tiết
                      </button>
                      <button onClick={() => openEdit(dealer)} className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts Management */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý hợp đồng & chỉ tiêu</h3>
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
                        Thời hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chỉ tiêu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đạt được
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.contractType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.startDate} - {contract.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.target} xe
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">{contract.achieved} xe</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              contract.achieved >= contract.target ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {Math.round((contract.achieved / contract.target) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-emerald-600 hover:text-emerald-900 mr-3">Sửa</button>
                          <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Debt Management */}
          {activeTab === 'debt' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý công nợ</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Xuất báo cáo công nợ
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Công nợ theo đại lý</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Đại lý Hà Nội</p>
                        <p className="text-sm text-gray-500">Hạn thanh toán: 2024-02-15</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">500,000 VNĐ</p>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Quá hạn
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Đại lý TP.HCM</p>
                        <p className="text-sm text-gray-500">Hạn thanh toán: 2024-02-20</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">300,000 VNĐ</p>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Sắp hạn
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Đại lý Đà Nẵng</p>
                        <p className="text-sm text-gray-500">Hạn thanh toán: 2024-03-10</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">150,000 VNĐ</p>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Bình thường
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Thống kê công nợ</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Công nợ quá hạn</p>
                          <p className="text-2xl font-bold text-red-900">500,000 VNĐ</p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Công nợ sắp hạn</p>
                          <p className="text-2xl font-bold text-yellow-900">300,000 VNĐ</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Công nợ bình thường</p>
                          <p className="text-2xl font-bold text-green-900">1,500,000 VNĐ</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* Add Dealer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm đại lý mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreateDealer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                  <input value={newDealer.name} onChange={(e)=>setNewDealer(v=>({...v,name:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Đại lý ABC" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <input value={newDealer.location} onChange={(e)=>setNewDealer(v=>({...v,location:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Hà Nội / TP.HCM" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                  <input value={newDealer.contact} onChange={(e)=>setNewDealer(v=>({...v,contact:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input value={newDealer.phone} onChange={(e)=>setNewDealer(v=>({...v,phone:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0123 456 789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={newDealer.email} onChange={(e)=>setNewDealer(v=>({...v,email:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="dealer@electra.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thành lập</label>
                  <input type="date" value={newDealer.establishedDate} onChange={(e)=>setNewDealer(v=>({...v,establishedDate:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={newDealer.status} onChange={(e)=>setNewDealer(v=>({...v,status:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="active">Hoạt động</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hiệu suất</label>
                  <select value={newDealer.performance} onChange={(e)=>setNewDealer(v=>({...v,performance:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="excellent">Xuất sắc</option>
                    <option value="good">Tốt</option>
                    <option value="average">Trung bình</option>
                    <option value="poor">Kém</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng</label>
                  <input type="number" min="0" value={newDealer.orders} onChange={(e)=>setNewDealer(v=>({...v,orders:Number(e.target.value)}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doanh thu</label>
                  <input value={newDealer.revenue} onChange={(e)=>setNewDealer(v=>({...v,revenue:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="8.5M" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng hợp đồng</label>
                  <select value={newDealer.contractStatus} onChange={(e)=>setNewDealer(v=>({...v,contractStatus:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="active">Đang hiệu lực</option>
                    <option value="pending">Chờ duyệt</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition">Tạo đại lý</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Dealer Modal */}
      {isDetailOpen && selectedDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsDetailOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đại lý</h3>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Tên đại lý</p>
                <p className="font-semibold text-gray-900">{selectedDealer.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Khu vực</p>
                <p className="font-semibold text-gray-900">{selectedDealer.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Người liên hệ</p>
                <p className="font-semibold text-gray-900">{selectedDealer.contact}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{selectedDealer.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{selectedDealer.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Ngày thành lập</p>
                <p className="font-semibold text-gray-900">{selectedDealer.establishedDate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDealer.status)}`}>{getStatusText(selectedDealer.status)}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Hiệu suất</p>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(selectedDealer.performance)}`}>{getPerformanceText(selectedDealer.performance)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selectedDealer.orders}</p>
                <p className="text-sm text-gray-500">Đơn hàng</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selectedDealer.revenue}</p>
                <p className="text-sm text-gray-500">Doanh thu</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dealer Modal */}
      {isEditOpen && editDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa đại lý</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateDealer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                  <input value={editDealer.name} onChange={(e)=>setEditDealer(v=>({...v,name:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <input value={editDealer.location} onChange={(e)=>setEditDealer(v=>({...v,location:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                  <input value={editDealer.contact} onChange={(e)=>setEditDealer(v=>({...v,contact:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input value={editDealer.phone} onChange={(e)=>setEditDealer(v=>({...v,phone:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editDealer.email} onChange={(e)=>setEditDealer(v=>({...v,email:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thành lập</label>
                  <input type="date" value={editDealer.establishedDate} onChange={(e)=>setEditDealer(v=>({...v,establishedDate:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={editDealer.status} onChange={(e)=>setEditDealer(v=>({...v,status:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="active">Hoạt động</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hiệu suất</label>
                  <select value={editDealer.performance} onChange={(e)=>setEditDealer(v=>({...v,performance:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="excellent">Xuất sắc</option>
                    <option value="good">Tốt</option>
                    <option value="average">Trung bình</option>
                    <option value="poor">Kém</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng</label>
                  <input type="number" min="0" value={editDealer.orders} onChange={(e)=>setEditDealer(v=>({...v,orders:Number(e.target.value)}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doanh thu</label>
                  <input value={editDealer.revenue} onChange={(e)=>setEditDealer(v=>({...v,revenue:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng hợp đồng</label>
                  <select value={editDealer.contractStatus} onChange={(e)=>setEditDealer(v=>({...v,contractStatus:e.target.value}))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="active">Đang hiệu lực</option>
                    <option value="pending">Chờ duyệt</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealerManagement;