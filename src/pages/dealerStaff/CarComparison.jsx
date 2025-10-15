import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { showError, showSuccess } from '../../store/slices/snackbarSlice';
import { getModelImage, mapBodyTypeToDisplay, formatPrice, formatNumber } from '../../utils/modelHelpers';

function CarComparison() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const models = useSelector((state) => state.models.items);
  const modelsStatus = useSelector((state) => state.models.status);
  const modelsError = useSelector((state) => state.models.error);
  
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  // Fetch models on component mount
  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  // Fallback hardcoded data for development
  const fallbackVehicles = [
    {
      id: 1,
      name: 'Electra Ascent',
      category: 'SUV',
      price: 320000000,
      range: 380,
      power: 150,
      torque: 300,
      acceleration: 8.5,
      topSpeed: 180,
      seating: 7,
      battery: 75,
      charging: '45 phút',
      warranty: '8 năm',
      image: '/src/assets/images/electra ascent.png',
      features: ['Lái tự động', 'Sạc nhanh', 'Hệ thống giải trí', 'Cảm biến an toàn', 'Ghế massage']
    },
    {
      id: 2,
      name: 'Electra CityLink',
      category: 'Sedan',
      price: 280000000,
      range: 320,
      power: 120,
      torque: 250,
      acceleration: 9.2,
      topSpeed: 160,
      seating: 5,
      battery: 60,
      charging: '40 phút',
      warranty: '7 năm',
      image: '/src/assets/images/electra citylink poster.png',
      features: ['Kết nối thông minh', 'Tiết kiệm năng lượng', 'Thiết kế sang trọng', 'An toàn cao', 'Hệ thống âm thanh']
    },
    {
      id: 3,
      name: 'Electra GrandTour',
      category: 'Luxury',
      price: 450000000,
      range: 420,
      power: 200,
      torque: 400,
      acceleration: 7.8,
      topSpeed: 200,
      seating: 5,
      battery: 85,
      charging: '50 phút',
      warranty: '10 năm',
      image: '/src/assets/images/electra grandtour.png',
      features: ['Nội thất da cao cấp', 'Hệ thống âm thanh', 'Lái tự động', 'Massage ghế', 'Công nghệ AI']
    },
    {
      id: 4,
      name: 'Electra Micro',
      category: 'Compact',
      price: 180000000,
      range: 200,
      power: 80,
      torque: 150,
      acceleration: 12.5,
      topSpeed: 120,
      seating: 4,
      battery: 40,
      charging: '30 phút',
      warranty: '5 năm',
      image: '/src/assets/images/electra micro.png',
      features: ['Thiết kế nhỏ gọn', 'Tiết kiệm năng lượng', 'Dễ đỗ xe', 'Giá cả hợp lý', 'Kết nối cơ bản']
    },
    {
      id: 5,
      name: 'Electra Summit',
      category: 'Luxury',
      price: 680000000,
      range: 450,
      power: 250,
      torque: 500,
      acceleration: 6.5,
      topSpeed: 220,
      seating: 5,
      battery: 100,
      charging: '60 phút',
      warranty: '12 năm',
      image: '/src/assets/images/electra summit.png',
      features: ['Hiệu suất cao', 'Công nghệ AI', 'Nội thất siêu sang', 'Tốc độ cao', 'Hệ thống an toàn nâng cao']
    },
    {
      id: 6,
      name: 'Electra Velocity',
      category: 'Sports',
      price: 850000000,
      range: 500,
      power: 300,
      torque: 600,
      acceleration: 4.2,
      topSpeed: 280,
      seating: 2,
      battery: 120,
      charging: '70 phút',
      warranty: '15 năm',
      image: '/src/assets/images/electra velocity.png',
      features: ['Tốc độ cao', 'Thiết kế thể thao', 'Hiệu suất đỉnh cao', 'Công nghệ F1', 'Hệ thống treo thể thao']
    }
  ];

  // Transform API models to vehicle format
  const transformModelToVehicle = (model) => {
    return {
      id: model.modelId,
      name: model.modelName,
      category: mapBodyTypeToDisplay(model.bodyType),
      price: model.price * 1000000, // Convert USD to VND
      range: model.range || 0,
      power: model.powerHp || 0,
      torque: model.torqueNm || 0,
      acceleration: model.acceleration || 0,
      topSpeed: 180, // Default value since not in API
      seating: model.seatingCapacity || 5,
      battery: model.batteryCapacity || 0,
      charging: '45 phút', // Default value since not in API
      warranty: '8 năm', // Default value since not in API
      image: getModelImage(model.modelName),
      features: model.description ? [model.description] : ['Tính năng tiêu chuẩn']
    };
  };

  // Transform models to vehicles, use fallback if no models available
  const vehicles = models.length > 0 ? models.map(transformModelToVehicle) : fallbackVehicles;

  const addVehicle = (vehicle) => {
    if (selectedVehicles.length < 3 && !selectedVehicles.find(v => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeVehicle = (vehicleId) => {
    setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
  };

  const comparisonSpecs = [
    { key: 'price', label: 'Giá bán', unit: 'VNĐ', format: 'currency' },
    { key: 'range', label: 'Quãng đường', unit: 'km', format: 'number' },
    { key: 'power', label: 'Công suất', unit: 'HP', format: 'number' },
    { key: 'torque', label: 'Mô-men xoắn', unit: 'Nm', format: 'number' },
    { key: 'acceleration', label: 'Tăng tốc 0-100', unit: 's', format: 'number' },
    { key: 'topSpeed', label: 'Tốc độ tối đa', unit: 'km/h', format: 'number' },
    { key: 'seating', label: 'Số chỗ ngồi', unit: 'chỗ', format: 'number' },
    { key: 'battery', label: 'Dung lượng pin', unit: 'kWh', format: 'number' },
    { key: 'charging', label: 'Thời gian sạc', unit: '', format: 'text' },
    { key: 'warranty', label: 'Bảo hành', unit: '', format: 'text' }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return formatPrice(value);
      case 'number':
        return formatNumber(value);
      case 'text':
        return value;
      default:
        return value;
    }
  };

  // Show loading state
  if (modelsStatus === 'loading') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách xe...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (modelsStatus === 'failed') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải danh sách xe</h3>
              <p className="text-gray-600 mb-4">{modelsError || 'Đã xảy ra lỗi không xác định'}</p>
              <button
                onClick={() => dispatch(getAllModelsThunk())}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">So sánh mẫu xe</h2>
          <button
            onClick={() => navigate('/dealer-staff')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Vehicle Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chọn xe để so sánh (tối đa 3 xe)</h3>
            <button
              onClick={() => setShowVehicleSelector(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm xe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(index => (
              <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                {selectedVehicles[index] ? (
                  <div className="text-center">
                    <img
                      src={selectedVehicles[index].image}
                      alt={selectedVehicles[index].name}
                      className="w-24 h-16 object-contain mx-auto mb-2"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150/f3f4f6/6b7280?text=Vehicle';
                      }}
                    />
                    <h4 className="font-semibold text-gray-900">{selectedVehicles[index].name}</h4>
                    <p className="text-sm text-gray-600">{selectedVehicles[index].category}</p>
                    <button
                      onClick={() => removeVehicle(selectedVehicles[index].id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p>Chọn xe để so sánh</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Selector Modal */}
        {showVehicleSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chọn xe để so sánh</h3>
                <button
                  onClick={() => setShowVehicleSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedVehicles.find(v => v.id === vehicle.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => addVehicle(vehicle)}
                  >
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-24 object-contain mb-2"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150/f3f4f6/6b7280?text=Vehicle';
                      }}
                    />
                    <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">{vehicle.category}</p>
                    <p className="text-sm font-medium text-emerald-600">
                      {vehicle.price.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedVehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thông số</th>
                  {selectedVehicles.map(vehicle => (
                    <th key={vehicle.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {vehicle.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonSpecs.map(spec => (
                  <tr key={spec.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {spec.label}
                    </td>
                    {selectedVehicles.map(vehicle => (
                      <td key={vehicle.id} className="px-4 py-3 text-sm text-gray-900 text-center">
                        {formatValue(vehicle[spec.key], spec.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Features Comparison */}
        {selectedVehicles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">So sánh tính năng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedVehicles.map(vehicle => (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{vehicle.name}</h4>
                  <div className="space-y-2">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedVehicles.length === 0 && (
          <div className="text-center py-12">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">
              {vehicles.length === 0 ? 'Không có xe nào để so sánh' : 'Chọn ít nhất 1 xe để bắt đầu so sánh'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarComparison;
