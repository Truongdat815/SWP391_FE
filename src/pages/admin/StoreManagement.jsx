import { useState } from 'react';

function StoreManagement() {
  const [activeTab, setActiveTab] = useState('stores');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeCounter, setStoreCounter] = useState(6); // Starting from 6 since we have 5 existing stores (1-5)
  
  // Form state for add/edit store modal
  const [formData, setFormData] = useState({
    store_id: null,
    province_name: '',
    store_name: '',
    owner_name: '',
    address: '',
    phone: '',
    status: 'active',
    contract_start_date: '',
    contract_end_date: '',
    created_by: ''
  });

  // Mock stores data
  const [stores, setStores] = useState([
    {
      id: 1,
      store_id: 1,
      store_name: 'Electra Hà Nội',
      province_name: 'Hà Nội',
      owner_name: 'Nguyễn Văn A',
      address: '123 Đường ABC, Quận XYZ, Hà Nội',
      phone: '0123456789',
      status: 'active',
      contract_start_date: '2023-01-01',
      contract_end_date: '2025-12-31',
      created_by: 'Admin',
      created_at: '2023-01-01',
      total_orders: 150,
      total_revenue: 2500000000
    },
    {
      id: 2,
      store_id: 2,
      store_name: 'Electra TP.HCM',
      province_name: 'TP.HCM',
      owner_name: 'Trần Thị B',
      address: '456 Đường DEF, Quận GHI, TP.HCM',
      phone: '0987654321',
      status: 'active',
      contract_start_date: '2023-02-01',
      contract_end_date: '2025-12-31',
      created_by: 'Admin',
      created_at: '2023-02-01',
      total_orders: 200,
      total_revenue: 3500000000
    },
    {
      id: 3,
      store_id: 3,
      store_name: 'Electra Đà Nẵng',
      province_name: 'Đà Nẵng',
      owner_name: 'Lê Văn C',
      address: '789 Đường JKL, Quận MNO, Đà Nẵng',
      phone: '0555123456',
      status: 'active',
      contract_start_date: '2023-03-01',
      contract_end_date: '2025-12-31',
      created_by: 'Admin',
      created_at: '2023-03-01',
      total_orders: 80,
      total_revenue: 1200000000
    },
    {
      id: 4,
      store_id: 4,
      store_name: 'Electra Hải Phòng',
      province_name: 'Hải Phòng',
      owner_name: 'Phạm Văn D',
      address: '321 Đường PQR, Quận STU, Hải Phòng',
      phone: '0333123456',
      status: 'pending',
      contract_start_date: '2024-01-01',
      contract_end_date: '2026-12-31',
      created_by: 'Admin',
      created_at: '2024-01-01',
      total_orders: 25,
      total_revenue: 400000000
    },
    {
      id: 5,
      store_id: 5,
      store_name: 'Electra Cần Thơ',
      province_name: 'Cần Thơ',
      owner_name: 'Hoàng Thị E',
      address: '654 Đường VWX, Quận YZA, Cần Thơ',
      phone: '0777123456',
      status: 'inactive',
      contract_start_date: '2023-06-01',
      contract_end_date: '2024-05-31',
      created_by: 'Admin',
      created_at: '2023-06-01',
      total_orders: 45,
      total_revenue: 800000000
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'suspended': return 'Tạm ngưng';
      default: return status;
    }
  };

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingStore) {
      // Update existing store
      setStores(prev => prev.map(store => 
        store.id === editingStore.id 
          ? { ...store, ...formData }
          : store
      ));
    } else {
      // Add new store
      const newStore = {
        ...formData,
        id: storeCounter,
        store_id: storeCounter,
        created_at: new Date().toISOString().split('T')[0],
        total_orders: 0,
        total_revenue: 0
      };
      setStores(prev => [...prev, newStore]);
      setStoreCounter(prev => prev + 1);
    }
    
    // Reset form and close modal
    setFormData({
      store_id: null,
      province_name: '',
      store_name: '',
      owner_name: '',
      address: '',
      phone: '',
      status: 'active',
      contract_start_date: '',
      contract_end_date: '',
      created_by: ''
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStore(null);
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      store_id: store.store_id,
      province_name: store.province_name,
      store_name: store.store_name,
      owner_name: store.owner_name,
      address: store.address,
      phone: store.phone,
      status: store.status,
      contract_start_date: store.contract_start_date,
      contract_end_date: store.contract_end_date,
      created_by: store.created_by
    });
    setShowEditModal(true);
  };

  const handleDelete = (storeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
      setStores(prev => prev.filter(store => store.id !== storeId));
    }
  };

  const handleCloseModal = () => {
    setFormData({
      store_id: null,
      province_name: '',
      store_name: '',
      owner_name: '',
      address: '',
      phone: '',
      status: 'active',
      contract_start_date: '',
      contract_end_date: '',
      created_by: ''
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStore(null);
  };

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.province_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'stores', name: 'Danh sách cửa hàng', count: stores.length },
    { id: 'analytics', name: 'Thống kê & Báo cáo', count: 0 }
  ];

  const renderStoresTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cửa hàng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chủ cửa hàng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Địa điểm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doanh thu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStores.map((store) => (
            <tr key={store.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold text-sm">
                      {store.store_name.split(' ')[1]?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{store.store_name}</div>
                    <div className="text-sm text-gray-500">{store.phone}</div>
                    <div className="text-xs text-gray-400">ID: {store.store_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {store.owner_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{store.province_name}</div>
                <div className="text-sm text-gray-500">{store.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(store.status)}`}>
                  {getStatusText(store.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{store.total_orders} đơn hàng</div>
                <div className="text-green-600 font-medium">
                  {store.total_revenue.toLocaleString('vi-VN')} VNĐ
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  onClick={() => handleEdit(store)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDelete(store.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Xóa
                </button>
                <button className="text-green-600 hover:text-green-900">
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số cửa hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Cửa hàng hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.filter(store => store.status === 'active').length}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.filter(store => store.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, store) => sum + store.total_revenue, 0).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu theo cửa hàng</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 font-medium">Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin và hoạt động của các cửa hàng đại lý</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm cửa hàng
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
                placeholder="Tìm kiếm cửa hàng..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
              <option>Chờ duyệt</option>
              <option>Tạm ngưng</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Tất cả tỉnh/thành</option>
              <option>Hà Nội</option>
              <option>TP.HCM</option>
              <option>Đà Nẵng</option>
              <option>Hải Phòng</option>
              <option>Cần Thơ</option>
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
                    ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'stores' && renderStoresTable()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>

      {/* Add/Edit Store Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingStore ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Auto-generated Store ID Display */}
                  {!editingStore && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store ID (Tự động tạo)
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                        {storeCounter}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Store ID sẽ được tự động tạo khi lưu</p>
                    </div>
                  )}

                  {/* Province Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province_name"
                      value={formData.province_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="An Giang">An Giang</option>
                      <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                      <option value="Bắc Giang">Bắc Giang</option>
                      <option value="Bắc Kạn">Bắc Kạn</option>
                      <option value="Bạc Liêu">Bạc Liêu</option>
                    </select>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="store_name"
                      value={formData.store_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên cửa hàng"
                      required
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chủ cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên chủ cửa hàng"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập địa chỉ chi tiết"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="suspended">Tạm ngưng</option>
                    </select>
                  </div>

                  {/* Contract Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="contract_start_date"
                      value={formData.contract_start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Contract End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="contract_end_date"
                      value={formData.contract_end_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Created By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người tạo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="created_by"
                      value={formData.created_by}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên người tạo"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingStore ? 'Cập nhật' : 'Tạo cửa hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreManagement;
