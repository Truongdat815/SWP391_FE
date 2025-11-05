import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getModelImage, getModelPoster, formatPrice, formatNumber } from '../../utils/modelHelpers';
import logo from '../../assets/images/logo.png';
import Tooltip from '@/components/ui/Tooltip';
import { get } from '@/api/client';

function CarDetail() {
  const { modelId } = useParams();
  
  const [currentModel, setCurrentModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState('main')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const fetchModels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try with token first, if fails with 401, try without token (public endpoint)
        let res;
        try {
            res = await get('/api/models/all');
        } catch (err) {
            // If 401, try as public endpoint
            if (err.message && err.message.includes('401')) {
                console.log('🔓 Trying as public endpoint (no token)...');
                res = await get('/api/models/all', { skipAuth: true });
            } else {
                throw err;
            }
        }
        
        // Handle different response structures
        let data = null;
        if (res?.data?.data && Array.isArray(res.data.data)) {
            data = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
            data = res.data;
        } else if (Array.isArray(res)) {
            data = res;
        } else {
            data = res?.data || res || [];
        }
        
        const foundModel = Array.isArray(data) 
          ? data.find(m => m.modelId === parseInt(modelId))
          : null;
        
        if (foundModel) {
          setCurrentModel(foundModel);
        } else {
          throw new Error(`Không tìm thấy xe với ID: ${modelId}`);
        }
        
      } catch (error) {
        console.error('Error fetching models:', error)
        setError(error.message || 'Không thể tải thông tin xe')
      } finally {
        setLoading(false)
      }
    }
    
    fetchModels()
  }, [modelId])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-emerald-400"></div>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 mt-6 text-lg font-medium"
          >
            Đang tải thông tin xe...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-3xl shadow-2xl max-w-md border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi kết nối</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Thử lại
          </button>
        </motion.div>
      </div>
    )
  }

  // Model not found
  if (!currentModel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-3xl shadow-2xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h1>
          <p className="text-gray-600 mb-6">Model ID "{modelId}" không tồn tại trong hệ thống</p>
          <Link 
            to="/cars" 
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Quay lại danh sách xe
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Modern Breadcrumb */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Trang chủ
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <Link to="/cars" className="text-gray-500 hover:text-emerald-600 transition-colors">
              Ô tô
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-gray-900 font-medium">{currentModel.modelName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Gallery */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  <img 
                    src={selectedImage === 'main' ? getModelImage(currentModel.modelName) : getModelPoster(currentModel.modelName)}
                    alt={currentModel.modelName}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => e.target.src = logo}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex space-x-3">
                        <Tooltip content="Xem hình ảnh chính của xe" placement="top">
                          <button
                            onClick={() => setSelectedImage('main')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedImage === 'main' 
                                ? 'bg-white text-emerald-600 shadow-lg' 
                                : 'bg-white/80 text-gray-600 hover:bg-white'
                            }`}
                          >
                            Hình chính
                          </button>
                        </Tooltip>
                        <Tooltip content="Xem poster quảng cáo của xe" placement="top">
                          <button
                            onClick={() => setSelectedImage('poster')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedImage === 'poster' 
                                ? 'bg-white text-emerald-600 shadow-lg' 
                                : 'bg-white/80 text-gray-600 hover:bg-white'
                            }`}
                          >
                            Poster
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setSelectedImage('main')}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === 'main' ? 'border-emerald-500 shadow-lg' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <img 
                    src={getModelImage(currentModel.modelName)} 
                    alt="Main view"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => setSelectedImage('poster')}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === 'poster' ? 'border-emerald-500 shadow-lg' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <img 
                    src={getModelPoster(currentModel.modelName)} 
                    alt="Poster view"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </motion.div>

            {/* Product Info - CHỈ HIỂN THỊ THÔNG TIN THỰC TỪ API */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Brand Badge */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                Xe điện <span className="font-bold text-emerald-600 ml-1">Electra</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  {currentModel.modelName}
                </h1>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  {formatPrice(currentModel.price)}
                </p>
              </div>

              {/* Description - chỉ hiển thị nếu có */}
              {currentModel.description && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {currentModel.description}
                </p>
              )}

              {/* Key Stats - CHỈ HIỂN THỊ CÁC TRƯỜNG CÓ DỮ LIỆU */}
              <div className="grid grid-cols-2 gap-6">
                {/* Chỉ hiển thị nếu có dữ liệu */}
                {currentModel.powerHp && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Công suất</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(currentModel.powerHp)} HP</div>
                  </div>
                )}

                {currentModel.range && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Tầm hoạt động</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(currentModel.range)} km</div>
                  </div>
                )}

                {currentModel.acceleration && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Gia tốc 0-100km/h</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(currentModel.acceleration)}s</div>
                  </div>
                )}

                {currentModel.seatingCapacity && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Chỗ ngồi</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(currentModel.seatingCapacity)}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Liên hệ đại lý
                </button>
                <button className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs Section - CHỈ HIỂN THỊ THÔNG TIN THỰC */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Tổng quan', icon: '📋' },
                { id: 'specs', label: 'Thông số kỹ thuật', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-6 px-4 border-b-2 font-semibold text-lg transition-all ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h3>
                    <div className="space-y-4">
                      {currentModel.modelYear && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Năm sản xuất</span>
                          <span className="font-bold text-gray-900">{currentModel.modelYear}</span>
                        </div>
                      )}
                      {currentModel.bodyType && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Kiểu dáng</span>
                          <span className="font-bold text-gray-900">{currentModel.bodyType}</span>
                        </div>
                      )}
                      {currentModel.batteryCapacity && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Dung lượng pin</span>
                          <span className="font-bold text-gray-900">{formatNumber(currentModel.batteryCapacity)} kWh</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">Hiệu suất</h3>
                    <div className="space-y-4">
                      {currentModel.torqueNm && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Mô-men xoắn</span>
                          <span className="font-bold text-gray-900">{formatNumber(currentModel.torqueNm)} Nm</span>
                        </div>
                      )}
                      {currentModel.powerHp && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Công suất</span>
                          <span className="font-bold text-gray-900">{formatNumber(currentModel.powerHp)} HP</span>
                        </div>
                      )}
                      {currentModel.range && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Tầm hoạt động</span>
                          <span className="font-bold text-gray-900">{formatNumber(currentModel.range)} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông số động cơ</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-4 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Loại động cơ</span>
                      <span className="font-bold text-gray-900">Điện</span>
                    </div>
                    {currentModel.powerHp && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Công suất</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.powerHp)} HP</span>
                      </div>
                    )}
                    {currentModel.torqueNm && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Mô-men xoắn</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.torqueNm)} Nm</span>
                      </div>
                    )}
                    {currentModel.acceleration && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Gia tốc 0-100 km/h</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.acceleration)} giây</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông số pin & khác</h3>
                  <div className="space-y-4">
                    {currentModel.batteryCapacity && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Dung lượng pin</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.batteryCapacity)} kWh</span>
                      </div>
                    )}
                    {currentModel.range && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Tầm hoạt động</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.range)} km</span>
                      </div>
                    )}
                    {currentModel.seatingCapacity && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Số chỗ ngồi</span>
                        <span className="font-bold text-gray-900">{formatNumber(currentModel.seatingCapacity)} chỗ</span>
                      </div>
                    )}
                    {currentModel.bodyType && (
                      <div className="flex justify-between py-4 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Kiểu dáng</span>
                        <span className="font-bold text-gray-900">{currentModel.bodyType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;