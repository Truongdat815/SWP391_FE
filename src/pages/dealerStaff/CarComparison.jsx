import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { showError, showSuccess } from '../../store/slices/snackbarSlice';
import { getModelImage, formatPrice, formatNumber } from '../../utils/modelHelpers';

// Body types mapping - same as EVM Staff
const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'VAN', label: 'Van' },
];

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

  // Transform API models to vehicle format
  const transformModelToVehicle = (model) => {
    // Extract features from description if available
    const features = model.description 
      ? model.description.split('.').map(f => f.trim()).filter(f => f.length > 0)
      : ['Tính năng tiêu chuẩn'];
    
    return {
      id: model.modelId,
      name: model.modelName,
      category: BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType, // Same as EVM Staff
      price: model.price || 0, // Price in USD (same as EVM Staff)
      range: model.range || 0,
      power: model.powerHp || 0,
      torque: model.torqueNm || 0,
      acceleration: model.acceleration || 0,
      seating: model.seatingCapacity || 5,
      battery: model.batteryCapacity || 0,
      modelYear: model.modelYear || new Date().getFullYear(),
      image: getModelImage(model.modelName),
      features: features
    };
  };

  // Transform models to vehicles from API only
  const vehicles = models.map(transformModelToVehicle);

  const addVehicle = (vehicle) => {
    if (selectedVehicles.length < 3 && !selectedVehicles.find(v => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeVehicle = (vehicleId) => {
    setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
  };

  const comparisonSpecs = [
    { key: 'modelYear', label: 'Năm sản xuất', unit: '', format: 'number' },
    { key: 'price', label: 'Giá bán', unit: 'USD', format: 'currency' },
    { key: 'battery', label: 'Dung lượng pin', unit: 'kWh', format: 'number' },
    { key: 'range', label: 'Tầm xa', unit: 'km', format: 'number' },
    { key: 'power', label: 'Công suất', unit: 'HP', format: 'number' },
    { key: 'torque', label: 'Mô-men xoắn', unit: 'Nm', format: 'number' },
    { key: 'acceleration', label: 'Tăng tốc 0-100km/h', unit: 's', format: 'number' },
    { key: 'seating', label: 'Số chỗ ngồi', unit: 'chỗ', format: 'number' }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        // Format as USD (same as EVM Staff)
        return `$${Number(value).toLocaleString('en-US')}`;
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">So sánh mẫu xe</h2>
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
                    <p className="text-sm font-medium text-emerald-600 mt-1">
                      ${Number(selectedVehicles[index].price).toLocaleString('en-US')}
                    </p>
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
                      ${Number(vehicle.price).toLocaleString('en-US')}
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
              {vehicles.length === 0 
                ? 'Chưa có xe nào trong hệ thống. Vui lòng thêm xe vào hệ thống trước.' 
                : 'Chọn ít nhất 1 xe để bắt đầu so sánh'}
            </p>
            {vehicles.length === 0 && (
              <button
                onClick={() => navigate('/evm-staff/vehicle-management')}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Quản lý xe
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CarComparison;
