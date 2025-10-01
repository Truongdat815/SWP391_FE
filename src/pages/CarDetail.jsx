import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Import images
import electraAscent from '../assets/images/electra ascent.png';
import electraCityLink from '../assets/images/electracitylink.png';
import electraGrandTour from '../assets/images/electra grandtour.png';
import electraMicro from '../assets/images/electra micro.png';
import electraSummit from '../assets/images/electra summit.png';
import electraUrbanPulse from '../assets/images/electra urbanpluse.png';
import electraVelocity from '../assets/images/electra velocity.png';
import electraVoyager from '../assets/images/electra voyager.png';
import logo from '../assets/images/logo.png';

function CarDetail() {
  const { model } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');


  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Scroll to top when component mounts or model changes
    window.scrollTo(0, 0)
    
    const fetchModels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Kiểm tra xem JSON Server có chạy không
      const response = await fetch('http://localhost:3001/models')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
      const data = await response.json()
      setModels(data)
        
        // Tìm model theo tên từ URL params
        const modelName = model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        const foundModel = data.find(m => 
          m.model_name.toLowerCase().replace(/\s+/g, '-') === model ||
          m.model_name === modelName ||
          m.model_name.toLowerCase().includes(model.toLowerCase())
        )
        setCurrentModel(foundModel)
        
        console.log('Models loaded:', data)
        console.log('Current model:', foundModel)
        console.log('URL param:', model)
        
      } catch (error) {
        console.error('Error fetching models:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchModels()
  }, [model])

  // Loading state
  if (loading) {
  return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin xe...</p>
        </div>
    </div>
  )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-20">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi kết nối API</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Hãy kiểm tra:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>JSON Server đã chạy chưa?</li>
              <li>Port 3001 có bị chiếm không?</li>
              <li>File db.json có tồn tại không?</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Model not found
  if (!currentModel) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-20">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h1>
          <p className="text-gray-600 mb-4">Model "{model}" không tồn tại trong hệ thống</p>
          <Link to="/cars" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Quay lại danh sách xe
          </Link>
        </div>
      </div>
    )
  }

  // Get image for model
  const getImage = (modelName) => {
    const imageMap = {
      'Electra Ascent': electraAscent,
      'Electra CityLink': electraCityLink,
      'Electra GrandTour': electraGrandTour,
      'Electra Micro': electraMicro,
      'Electra Summit': electraSummit,
      'Electra UrbanPulse': electraUrbanPulse,
      'Electra Velocity': electraVelocity,
      'Electra Voyager': electraVoyager
    };
    
    console.log('Looking for image for model:', modelName);
    console.log('Image will be:', imageMap[modelName] || logo);
    
    return imageMap[modelName] || logo;
  };

  // Success - show car detail
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <Link to="/cars" className="ml-1 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors md:ml-2">
                    Ô tô
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{currentModel.model_name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <img 
                    src={getImage(currentModel.model_name)}
                    alt={currentModel.model_name}
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = logo;
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully for:', currentModel.model_name);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Xe điện <span className="text-green-600">Electra</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">{currentModel.model_name}</h1>
                <p className="text-2xl text-emerald-600 font-bold">
                  Từ <span className="text-3xl">{currentModel.price.toLocaleString('vi-VN')} VNĐ</span>
                </p>
                <p className="text-gray-600 mt-4 text-lg">{currentModel.description}</p>
              </div>

              {/* Color Selection */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Màu sắc</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 mr-3" style={{ backgroundColor: currentModel.color }}></div>
                  <span className="text-gray-700 font-medium">{currentModel.color}</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông số chính</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{currentModel.range_km} km</div>
                    <div className="text-sm text-gray-600">Tầm hoạt động</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{currentModel.power_hp} HP</div>
                    <div className="text-sm text-gray-600">Công suất</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{currentModel.acceleration}s</div>
                    <div className="text-sm text-gray-600">0-100 km/h</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{currentModel.seating_capacity}</div>
                    <div className="text-sm text-gray-600">Chỗ ngồi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Thông số kỹ thuật</h3>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Năm sản xuất</span>
                  <span className="text-gray-900 font-bold">{currentModel.model_year}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Dung lượng pin</span>
                  <span className="text-gray-900 font-bold">{currentModel.battery_capacity} kWh</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Tầm hoạt động</span>
                  <span className="text-gray-900 font-bold">{currentModel.range_km} km</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Công suất</span>
                  <span className="text-gray-900 font-bold">{currentModel.power_hp} HP</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Mô-men xoắn</span>
                  <span className="text-gray-900 font-bold">{currentModel.torque_nm} Nm</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Gia tốc 0-100 km/h</span>
                  <span className="text-gray-900 font-bold">{currentModel.acceleration} giây</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Số chỗ ngồi</span>
                  <span className="text-gray-900 font-bold">{currentModel.seating_capacity} chỗ</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Kiểu dáng</span>
                  <span className="text-gray-900 font-bold">{currentModel.body_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default CarDetail;