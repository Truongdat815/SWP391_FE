import { useState } from 'react';

function PricingManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('wholesale');

  const pricingData = [
    {
      model: 'Electra Ascent',
      basePrice: 850000000,
      wholesalePrice: 765000000,
      dealerMargin: '10%',
      promotions: [
        { name: 'Khuyến mãi Q1', discount: '5%', validUntil: '2024-03-31', status: 'active' },
        { name: 'Khuyến mãi tháng 2', discount: '3%', validUntil: '2024-02-29', status: 'active' }
      ]
    },
    {
      model: 'Electra CityLink',
      basePrice: 650000000,
      wholesalePrice: 585000000,
      dealerMargin: '10%',
      promotions: [
        { name: 'Khuyến mãi Q1', discount: '5%', validUntil: '2024-03-31', status: 'active' }
      ]
    },
    {
      model: 'Electra GrandTour',
      basePrice: 1200000000,
      wholesalePrice: 1080000000,
      dealerMargin: '10%',
      promotions: []
    },
    {
      model: 'Electra Micro',
      basePrice: 450000000,
      wholesalePrice: 405000000,
      dealerMargin: '10%',
      promotions: [
        { name: 'Khuyến mãi tháng 2', discount: '8%', validUntil: '2024-02-29', status: 'active' }
      ]
    }
  ];

  const dealerPricing = [
    {
      dealerName: 'Đại lý Hà Nội',
      tier: 'Gold',
      discountRate: '15%',
      specialPricing: [
        { model: 'Electra Ascent', specialPrice: 722500000, reason: 'Đại lý vàng' },
        { model: 'Electra CityLink', specialPrice: 552500000, reason: 'Đại lý vàng' }
      ]
    },
    {
      dealerName: 'Đại lý TP.HCM',
      tier: 'Gold',
      discountRate: '15%',
      specialPricing: [
        { model: 'Electra Ascent', specialPrice: 722500000, reason: 'Đại lý vàng' },
        { model: 'Electra GrandTour', specialPrice: 918000000, reason: 'Đại lý vàng' }
      ]
    },
    {
      dealerName: 'Đại lý Đà Nẵng',
      tier: 'Silver',
      discountRate: '12%',
      specialPricing: []
    },
    {
      dealerName: 'Đại lý Cần Thơ',
      tier: 'Bronze',
      discountRate: '10%',
      specialPricing: []
    }
  ];

  const tabs = [
    { id: 'wholesale', name: 'Giá sỉ chung', icon: '💰' },
    { id: 'dealer-specific', name: 'Giá theo đại lý', icon: '🏢' },
    { id: 'promotions', name: 'Khuyến mãi', icon: '🎁' }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPromotionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giá sỉ</h1>
          <p className="text-gray-600 mt-1">Quản lý giá sỉ, khuyến mãi theo đại lý</p>
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
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trung bình giá sỉ</p>
              <p className="text-2xl font-bold text-gray-900">675M VNĐ</p>
              <p className="text-sm text-green-600">+2%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đại lý vàng</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-blue-600">Giảm 15%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Khuyến mãi đang chạy</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-purple-600">Hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ lợi nhuận TB</p>
              <p className="text-2xl font-bold text-gray-900">10%</p>
              <p className="text-sm text-orange-600">Ổn định</p>
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
          {/* Wholesale Pricing */}
          {activeTab === 'wholesale' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Bảng giá sỉ chung</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Cập nhật giá
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
                        Giá bán lẻ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá sỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biên lợi nhuận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khuyến mãi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pricingData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{item.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(item.basePrice)} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                          {formatPrice(item.wholesalePrice)} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.dealerMargin}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {item.promotions.length > 0 ? (
                              item.promotions.map((promo, idx) => (
                                <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                  {promo.discount}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Không có</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-emerald-600 hover:text-emerald-900 mr-3">Sửa giá</button>
                          <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dealer Specific Pricing */}
          {activeTab === 'dealer-specific' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Giá theo từng đại lý</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Thiết lập giá đặc biệt
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dealerPricing.map((dealer, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{dealer.dealerName}</h4>
                        <p className="text-sm text-gray-500">Tỷ lệ giảm giá: {dealer.discountRate}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTierColor(dealer.tier)}`}>
                        {dealer.tier}
                      </span>
                    </div>

                    {dealer.specialPricing.length > 0 ? (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Giá đặc biệt:</h5>
                        {dealer.specialPricing.map((special, idx) => (
                          <div key={idx} className="p-3 bg-emerald-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{special.model}</p>
                                <p className="text-sm text-gray-500">{special.reason}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-600">
                                  {formatPrice(special.specialPrice)} VNĐ
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="text-gray-500">Áp dụng giá sỉ chung</p>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition">
                        Thiết lập giá
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                        Xem lịch sử
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promotions */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý khuyến mãi</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Tạo khuyến mãi mới
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pricingData
                  .filter(item => item.promotions.length > 0)
                  .map((item, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.model}</h4>
                          <p className="text-sm text-gray-500">Giá sỉ: {formatPrice(item.wholesalePrice)} VNĐ</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {item.promotions.map((promo, idx) => (
                          <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{promo.name}</h5>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPromotionStatusColor(promo.status)}`}>
                                {promo.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Giảm giá</p>
                                <p className="font-bold text-emerald-600">{promo.discount}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Hạn đến</p>
                                <p className="font-medium text-gray-900">{promo.validUntil}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex space-x-2">
                              <button className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded text-sm hover:bg-emerald-700 transition">
                                Chỉnh sửa
                              </button>
                              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition">
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Promotion Creation Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Tạo khuyến mãi mới</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mẫu xe</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Chọn mẫu xe</option>
                      <option>Electra Ascent</option>
                      <option>Electra CityLink</option>
                      <option>Electra GrandTour</option>
                      <option>Electra Micro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên khuyến mãi</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nhập tên khuyến mãi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tỷ lệ giảm giá</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: 5%" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hạn đến</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Tạo khuyến mãi
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

export default PricingManagement;