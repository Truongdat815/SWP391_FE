import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function VehicleDetail() {
  const { model } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  // Mock data for VinFast vehicles
  const vehicles = {
    'vf3': {
      name: 'VinFast VF3',
      image: 'https://vinfast-vn.vn/wp-content/uploads/2024/05/VinFast-VF3-mau-xanh-bo-doi.jpg',
      variants: [
        { name: 'VinFast VF3 2025', price: '299.000.000', features: ['Pin 42kWh', 'Quãng đường 200km', 'Sạc nhanh 30 phút'] }
      ],
      colors: [
        { name: 'Vàng', code: '#FFD700' },
        { name: 'Đen', code: '#000000' },
        { name: 'Trắng', code: '#FFFFFF' }
      ],
      specifications: {
        'Dung tích pin': '42 kWh',
        'Quãng đường': '200 km',
        'Công suất': '110 kW',
        'Mô-men xoắn': '240 Nm',
        'Tăng tốc 0-100': '8.5 giây',
        'Tốc độ tối đa': '120 km/h',
        'Sạc nhanh': '30 phút (0-80%)',
        'Sạc thường': '6 giờ'
      }
    },
    'vf5': {
      name: 'VinFast VF5',
      image: 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png',
      variants: [
        { name: 'VinFast VF5 Plus', price: '529.000.000', features: ['Pin 57kWh', 'Quãng đường 300km', 'Sạc nhanh 25 phút'] }
      ],
      colors: [
        { name: 'Đỏ', code: '#DC143C' },
        { name: 'Đen', code: '#000000' },
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Xám', code: '#808080' }
      ],
      specifications: {
        'Dung tích pin': '57 kWh',
        'Quãng đường': '300 km',
        'Công suất': '150 kW',
        'Mô-men xoắn': '320 Nm',
        'Tăng tốc 0-100': '7.2 giây',
        'Tốc độ tối đa': '130 km/h',
        'Sạc nhanh': '25 phút (0-80%)',
        'Sạc thường': '7 giờ'
      }
    },
    'vf6': {
      name: 'VinFast VF6',
      image: 'https://vinfastbinhbaominh.vn/wp-content/uploads/2024/10/vf6-1.jpg',
      variants: [
        { name: 'VinFast VF6 Eco', price: '689.000.000', features: ['Pin 64kWh', 'Quãng đường 380km', 'Sạc nhanh 22 phút'] },
        { name: 'VinFast VF6 Plus', price: '749.000.000', features: ['Pin 64kWh', 'Quãng đường 380km', 'Sạc nhanh 22 phút', 'Nội thất cao cấp'] }
      ],
      colors: [
        { name: 'Xanh', code: '#0066CC' },
        { name: 'Đen', code: '#000000' },
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Xám', code: '#808080' }
      ],
      specifications: {
        'Dung tích pin': '64 kWh',
        'Quãng đường': '380 km',
        'Công suất': '170 kW',
        'Mô-men xoắn': '350 Nm',
        'Tăng tốc 0-100': '6.8 giây',
        'Tốc độ tối đa': '140 km/h',
        'Sạc nhanh': '22 phút (0-80%)',
        'Sạc thường': '8 giờ'
      }
    },
    'vf7': {
      name: 'VinFast VF7',
      image: 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VF7/VinFast-he-lo-thong-so-co-ban-2-mau-xe-dien-VF-6-va-VF-7-9-1669022740-32-width740height493.jpg',
      variants: [
        { name: 'VinFast VF7 Eco', price: '799.000.000', features: ['Pin 71kWh', 'Quãng đường 450km', 'Sạc nhanh 20 phút'] },
        { name: 'VinFast VF7 Plus (Trần thép)', price: '949.000.000', features: ['Pin 71kWh', 'Quãng đường 450km', 'Sạc nhanh 20 phút', 'Trần thép'] },
        { name: 'VinFast VF7 Plus (Trần kính)', price: '969.000.000', features: ['Pin 71kWh', 'Quãng đường 450km', 'Sạc nhanh 20 phút', 'Trần kính panorama'] }
      ],
      colors: [
        { name: 'Xám đen', code: '#2F2F2F' },
        { name: 'Đen', code: '#000000' },
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Xanh navy', code: '#000080' }
      ],
      specifications: {
        'Dung tích pin': '71 kWh',
        'Quãng đường': '450 km',
        'Công suất': '200 kW',
        'Mô-men xoắn': '400 Nm',
        'Tăng tốc 0-100': '5.9 giây',
        'Tốc độ tối đa': '150 km/h',
        'Sạc nhanh': '20 phút (0-80%)',
        'Sạc thường': '9 giờ'
      }
    },
    'vf8': {
      name: 'VinFast VF8',
      image: 'https://static-cms-prod.vinfastauto.us/2025-03/exterior-color-blue_0.webp',
      variants: [
        { name: 'VinFast VF8 Eco', price: '1.019.000.000', features: ['Pin 82kWh', 'Quãng đường 500km', 'Sạc nhanh 18 phút'] },
        { name: 'VinFast VF8 Plus', price: '1.199.000.000', features: ['Pin 82kWh', 'Quãng đường 500km', 'Sạc nhanh 18 phút', 'Nội thất cao cấp'] }
      ],
      colors: [
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Đen', code: '#000000' },
        { name: 'Xám', code: '#808080' },
        { name: 'Xanh navy', code: '#000080' }
      ],
      specifications: {
        'Dung tích pin': '82 kWh',
        'Quãng đường': '500 km',
        'Công suất': '250 kW',
        'Mô-men xoắn': '500 Nm',
        'Tăng tốc 0-100': '5.5 giây',
        'Tốc độ tối đa': '160 km/h',
        'Sạc nhanh': '18 phút (0-80%)',
        'Sạc thường': '10 giờ'
      }
    },
    'vf9': {
      name: 'VinFast VF9',
      image: 'https://i1-vnexpress.vnecdn.net/2023/03/27/VF9thumjpg-1679907708.jpg?w=750&h=450&q=100&dpr=1&fit=crop&s=Swpqo7PubMKfM8H_JnC3Pw',
      variants: [
        { name: 'VinFast VF9 Eco', price: '1.499.000.000', features: ['Pin 106kWh', 'Quãng đường 600km', 'Sạc nhanh 15 phút'] },
        { name: 'VinFast VF9 Plus', price: '1.699.000.000', features: ['Pin 106kWh', 'Quãng đường 600km', 'Sạc nhanh 15 phút', 'Nội thất cao cấp'] }
      ],
      colors: [
        { name: 'Xanh', code: '#0066CC' },
        { name: 'Đen', code: '#000000' },
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Xám', code: '#808080' }
      ],
      specifications: {
        'Dung tích pin': '106 kWh',
        'Quãng đường': '600 km',
        'Công suất': '300 kW',
        'Mô-men xoắn': '620 Nm',
        'Tăng tốc 0-100': '5.0 giây',
        'Tốc độ tối đa': '170 km/h',
        'Sạc nhanh': '15 phút (0-80%)',
        'Sạc thường': '12 giờ'
      }
    }
  };

  const vehicle = vehicles[model];

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin xe</h1>
          <button 
            onClick={() => navigate('/dashboard/dealer-staff')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{vehicle.name}</h1>
                <p className="text-sm text-gray-500">Thông tin chi tiết và giá niêm yết</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                Tạo báo giá
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Đặt lịch lái thử
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Image */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-12">
              <img 
                src={vehicle.image} 
                alt={vehicle.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x600/FF0000/FFFFFF?text=${vehicle.name}`;
                }}
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Màu sắc có sẵn</h2>
              <div className="grid grid-cols-4 gap-4">
                {vehicle.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`p-3 rounded-lg border-2 ${
                      selectedColor === index ? 'border-red-500' : 'border-gray-200'
                    } hover:border-red-300 transition`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: color.code }}
                    ></div>
                    <span className="text-sm text-gray-700">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-6">
            {/* Variants and Pricing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Phiên bản và giá</h2>
              <div className="space-y-4">
                {vehicle.variants.map((variant, index) => (
                  <div 
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedVariant === index 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{variant.name}</h3>
                        <div className="space-y-1">
                          {variant.features.map((feature, idx) => (
                            <p key={idx} className="text-sm text-gray-600">• {feature}</p>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-red-600">{formatPrice(variant.price)}</p>
                        <p className="text-sm text-gray-500">Giá niêm yết</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition">
                  Tạo báo giá cho khách
                </button>
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition">
                  Đặt lịch lái thử
                </button>
                <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition">
                  So sánh với xe khác
                </button>
                <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition">
                  Xem khuyến mãi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(vehicle.specifications).map(([key, value]) => (
              <div key={key} className="text-center p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{key}</h4>
                <p className="text-lg font-semibold text-red-600">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion Banner */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Chương trình ưu đãi đặc biệt</h3>
              <p className="text-red-100">
                Giá trên là giá công bố của Hãng. Để được mua xe {vehicle.name} giá tốt nhất + Khuyến mãi nhiều nhất 
                hãy gọi cho ngay cho Phòng BH: <span className="font-bold">0964.054.962</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Hotline 0964.054.962
              </button>
              <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition">
                BÁO GIÁ NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetail;
