import { useState } from 'react';

function ProductManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('versions');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const carModels = [
    { id: 1, name: 'Electra Ascent', category: 'SUV', basePrice: 850000000, colors: ['Trắng', 'Đen', 'Xanh', 'Đỏ'], status: 'active' },
    { id: 2, name: 'Electra CityLink', category: 'Sedan', basePrice: 650000000, colors: ['Trắng', 'Xám', 'Xanh'], status: 'active' },
    { id: 3, name: 'Electra GrandTour', category: 'Luxury', basePrice: 1200000000, colors: ['Đen', 'Trắng', 'Vàng'], status: 'active' },
    { id: 4, name: 'Electra Micro', category: 'Compact', basePrice: 450000000, colors: ['Cam', 'Xanh', 'Trắng'], status: 'active' },
    { id: 5, name: 'Electra Summit', category: 'SUV', basePrice: 950000000, colors: ['Đen', 'Trắng', 'Xám'], status: 'active' },
    { id: 6, name: 'Electra UrbanPulse', category: 'City', basePrice: 550000000, colors: ['Xanh', 'Trắng', 'Đỏ'], status: 'active' },
    { id: 7, name: 'Electra Velocity', category: 'Sport', basePrice: 1100000000, colors: ['Đỏ', 'Đen', 'Trắng'], status: 'active' },
    { id: 8, name: 'Electra Voyager', category: 'Family', basePrice: 750000000, colors: ['Xám', 'Trắng', 'Xanh'], status: 'active' }
  ];

  const tabs = [
    { id: 'models', name: 'Quản lý mẫu xe', icon: '🚗' },
    { id: 'versions', name: 'Quản lý phiên bản', icon: '⚙️' },
  
  ];

  const [versions, setVersions] = useState([
    { id: 1, modelName: 'Electra Ascent', version: 'Base', price: 850000000, stock: 45, status: 'active' },
    { id: 2, modelName: 'Electra Ascent', version: 'Premium', price: 950000000, stock: 28, status: 'active' },
    { id: 3, modelName: 'Electra CityLink', version: 'Standard', price: 650000000, stock: 78, status: 'active' },
  ]);

  const [newVersion, setNewVersion] = useState({ modelId: carModels[0].id, version: '', price: '', stock: '', status: 'active' });

  const formatCurrency = (value) => Number(value).toLocaleString('vi-VN') + ' VNĐ';

  const openAddModal = () => {
    setNewVersion({ modelId: carModels[0].id, version: '', price: '', stock: '', status: 'active' });
    setIsAddOpen(true);
  };

  const handleCreateVersion = (e) => {
    e.preventDefault();
    const model = carModels.find(m => m.id === Number(newVersion.modelId));
    const created = {
      id: Date.now(),
      modelName: model?.name || '',
      version: newVersion.version || '—',
      price: Number(newVersion.price || 0),
      stock: Number(newVersion.stock || 0),
      status: newVersion.status,
    };
    setVersions(prev => [created, ...prev]);
    setIsAddOpen(false);
    setSuccessMsg('Đã thêm phiên bản mới');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Ngưng bán';
      default: return status;
    }
  };

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm & phân phối</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục xe điện, mẫu, phiên bản và màu sắc</p>
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

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">
          {successMsg}
        </div>
      )}

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
          {/* Models Management */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh mục xe điện</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Thêm mẫu xe mới
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {carModels.map((model) => (
                  <div key={model.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(model.status)}`}>
                        {getStatusText(model.status)}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{model.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">Phân khúc: {model.category}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Màu sắc có sẵn:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.colors.map((color, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-lg font-bold text-emerald-600">
                        {model.basePrice.toLocaleString('vi-VN')} VNĐ
                      </p>
                      <p className="text-xs text-gray-500">Giá cơ bản</p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 transition text-sm">
                        Chỉnh sửa
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition text-sm">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Versions Management */}
          {activeTab === 'versions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý phiên bản xe</h3>
                <button onClick={openAddModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition shadow-sm">
                  Thêm phiên bản mới
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mẫu xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phiên bản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá bán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tồn kho
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
                    {versions.map(v => (
                      <tr key={v.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.modelName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.version}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(v.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v.status)}`}>
                            {getStatusText(v.status)}
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

          
         
        </div>
      </div>

      {/* Add Version Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl border border-gray-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm phiên bản mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe</label>
                  <select value={newVersion.modelId} onChange={(e) => setNewVersion(v => ({ ...v, modelId: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {carModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phiên bản</label>
                  <input value={newVersion.version} onChange={(e) => setNewVersion(v => ({ ...v, version: e.target.value }))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Base / Premium / ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input type="number" min="0" value={newVersion.price} onChange={(e) => setNewVersion(v => ({ ...v, price: e.target.value }))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="850000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input type="number" min="0" value={newVersion.stock} onChange={(e) => setNewVersion(v => ({ ...v, stock: e.target.value }))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={newVersion.status} onChange={(e) => setNewVersion(v => ({ ...v, status: e.target.value }))} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngưng bán</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition">Tạo phiên bản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;