import { useState } from 'react';

function CarListing({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const vehicles = [
    {
      id: 1,
      name: 'Electra Ascent',
      category: 'suv',
      price: 320000000,
      range: 380,
      power: 150,
      acceleration: 8.5,
      seating: 7,
      image: '/src/assets/images/electra ascent.png',
      description: 'SUV điện cao cấp với không gian rộng rãi và tính năng lái tự động',
      features: ['Lái tự động', 'Sạc nhanh', 'Hệ thống giải trí', 'Cảm biến an toàn']
    },
    {
      id: 2,
      name: 'Electra CityLink',
      category: 'sedan',
      price: 280000000,
      range: 320,
      power: 120,
      acceleration: 9.2,
      seating: 5,
      image: '/src/assets/images/electra citylink poster.png',
      description: 'Sedan điện thông minh cho thành phố với thiết kế hiện đại',
      features: ['Kết nối thông minh', 'Tiết kiệm năng lượng', 'Thiết kế sang trọng', 'An toàn cao']
    },
    {
      id: 3,
      name: 'Electra GrandTour',
      category: 'luxury',
      price: 450000000,
      range: 420,
      power: 200,
      acceleration: 7.8,
      seating: 5,
      image: '/src/assets/images/electra grandtour.png',
      description: 'Xe điện sang trọng với nội thất cao cấp và hiệu suất vượt trội',
      features: ['Nội thất da cao cấp', 'Hệ thống âm thanh', 'Lái tự động', 'Massage ghế']
    },
    {
      id: 4,
      name: 'Electra Micro',
      category: 'compact',
      price: 180000000,
      range: 200,
      power: 80,
      acceleration: 12.5,
      seating: 4,
      image: '/src/assets/images/electra micro.png',
      description: 'Xe điện nhỏ gọn, tiết kiệm cho việc di chuyển trong thành phố',
      features: ['Thiết kế nhỏ gọn', 'Tiết kiệm năng lượng', 'Dễ đỗ xe', 'Giá cả hợp lý']
    },
    {
      id: 5,
      name: 'Electra Summit',
      category: 'luxury',
      price: 680000000,
      range: 450,
      power: 250,
      acceleration: 6.5,
      seating: 5,
      image: '/src/assets/images/electra summit.png',
      description: 'Xe điện siêu sang với hiệu suất cao và công nghệ tiên tiến',
      features: ['Hiệu suất cao', 'Công nghệ AI', 'Nội thất siêu sang', 'Tốc độ cao']
    },
    {
      id: 6,
      name: 'Electra Velocity',
      category: 'sports',
      price: 850000000,
      range: 500,
      power: 300,
      acceleration: 4.2,
      seating: 2,
      image: '/src/assets/images/electra velocity.png',
      description: 'Siêu xe điện với tốc độ và hiệu suất đỉnh cao',
      features: ['Tốc độ cao', 'Thiết kế thể thao', 'Hiệu suất đỉnh cao', 'Công nghệ F1']
    },
    {
      id: 7,
      name: 'Electra UrbanPulse',
      category: 'compact',
      price: 220000000,
      range: 280,
      power: 100,
      acceleration: 10.8,
      seating: 5,
      image: '/src/assets/images/electra urbanpluse.png',
      description: 'Xe điện đô thị với thiết kế năng động và tiết kiệm',
      features: ['Thiết kế năng động', 'Tiết kiệm năng lượng', 'Kết nối thông minh', 'Giá cả hợp lý']
    },
    {
      id: 8,
      name: 'Electra Voyager',
      category: 'suv',
      price: 750000000,
      range: 400,
      power: 220,
      acceleration: 7.2,
      seating: 8,
      image: '/src/assets/images/electra voyager.png',
      description: 'SUV điện lớn với không gian rộng rãi cho gia đình',
      features: ['Không gian rộng rãi', 'Ghế thứ 3', 'An toàn gia đình', 'Tiện nghi cao']
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', count: vehicles.length },
    { id: 'suv', name: 'SUV', count: vehicles.filter(v => v.category === 'suv').length },
    { id: 'sedan', name: 'Sedan', count: vehicles.filter(v => v.category === 'sedan').length },
    { id: 'luxury', name: 'Luxury', count: vehicles.filter(v => v.category === 'luxury').length },
    { id: 'compact', name: 'Compact', count: vehicles.filter(v => v.category === 'compact').length },
    { id: 'sports', name: 'Sports', count: vehicles.filter(v => v.category === 'sports').length }
  ];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesCategory = selectedCategory === 'all' || vehicle.category === selectedCategory;
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Danh mục xe Electra</h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-48 object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=Electra+Vehicle';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {getCategoryName(vehicle.category)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{vehicle.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vehicle.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Quãng đường:</span>
                    <p>{vehicle.range} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Công suất:</span>
                    <p>{vehicle.power} HP</p>
                  </div>
                  <div>
                    <span className="font-medium">Tăng tốc:</span>
                    <p>{vehicle.acceleration}s</p>
                  </div>
                  <div>
                    <span className="font-medium">Chỗ ngồi:</span>
                    <p>{vehicle.seating} chỗ</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Tính năng nổi bật:</p>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 2 && (
                      <span className="text-xs text-gray-500">+{vehicle.features.length - 2} khác</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      {vehicle.price.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500">Không tìm thấy xe nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarListing;
