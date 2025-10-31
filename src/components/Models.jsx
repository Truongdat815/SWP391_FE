import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedImage from '../components/Animated';
import { Link } from 'react-router-dom';
import { get } from '@/api/client';
import { getModelImage } from '../utils/modelHelpers';
import Tooltip from './ui/Tooltip';

const Models = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        console.log('📦 Raw API response:', res);
        
        // Handle different response structures
        let modelsData = null;
        
        // Check multiple possible response structures
        if (res?.data?.data && Array.isArray(res.data.data)) {
          modelsData = res.data.data;
          console.log('✅ Found data in res.data.data:', modelsData);
        } else if (res?.data && Array.isArray(res.data)) {
          modelsData = res.data;
          console.log('✅ Found data in res.data:', modelsData);
        } else if (Array.isArray(res)) {
          modelsData = res;
          console.log('✅ Found data in res:', modelsData);
        } else {
          console.warn('⚠️ Unexpected response structure:', res);
          modelsData = [];
        }
        
        if (modelsData && Array.isArray(modelsData)) {
          console.log(`✅ Setting ${modelsData.length} models`);
          setModels(modelsData);
        } else {
          console.warn('⚠️ Models data is not an array:', modelsData);
          setModels([]);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy danh sách model:', err);
        setError(err.message || 'Không thể tải danh sách mẫu xe');
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, []);

  return (
    <section id="models" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dòng xe{' '}
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              <span className="text-green-600">Electra</span>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện đa dạng, từ xe đô thị nhỏ gọn đến SUV cao cấp, 
            tất cả đều được thiết kế để mang đến trải nghiệm lái xe tuyệt vời.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách mẫu xe...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* No Models Found */}
        {!loading && !error && models.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có mẫu xe nào</h3>
            <p className="text-gray-600">Hiện tại chưa có mẫu xe nào trong hệ thống.</p>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && !error && models.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {models.map((model, index) => (
            <motion.div
              key={model.modelId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <AnimatedImage
                  src={getModelImage(model.modelName)}
                  alt={model.modelName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    console.log('Image failed to load for model:', model.modelName);
                    if (e?.target) e.target.src = '/src/assets/images/logo.png';
                  }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-green-600 to-green-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {model.bodyType || 'EV'}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      className="text-white"
                    >
                      <div className="flex space-x-2">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.batteryCapacity ? `Pin ${model.batteryCapacity}kWh` : 'Pin N/A'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.range ? `Quãng đường ${model.range}km` : 'Quãng đường N/A'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.powerHp ? `${model.powerHp} HP` : 'Công suất N/A'}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {model.modelName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {model.modelYear ? `Model ${model.modelYear}` : 'Mẫu xe điện thông minh'}
                  {model.bodyType && ` • ${model.bodyType}`}
                </p>
                
                {/* Specifications Grid - Hiển thị thông số kỹ thuật */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Pin</div>
                    <div className="font-semibold text-gray-900">
                      {model.batteryCapacity ? `${model.batteryCapacity} kWh` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Quãng đường</div>
                    <div className="font-semibold text-gray-900">
                      {model.range ? `${model.range} km` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Công suất</div>
                    <div className="font-semibold text-gray-900">
                      {model.powerHp ? `${model.powerHp} HP` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Mô-men xoắn</div>
                    <div className="font-semibold text-gray-900">
                      {model.torqueNm ? `${model.torqueNm} Nm` : 'N/A'}
                    </div>
                  </div>
                  {model.acceleration && (
                    <div className="bg-gray-50 p-2 rounded col-span-2">
                      <div className="text-gray-500 mb-1">Tăng tốc (0-100km/h)</div>
                      <div className="font-semibold text-gray-900">{model.acceleration}s</div>
                    </div>
                  )}
                  {model.seatingCapacity && (
                    <div className="bg-gray-50 p-2 rounded col-span-2">
                      <div className="text-gray-500 mb-1">Số chỗ ngồi</div>
                      <div className="font-semibold text-gray-900">{model.seatingCapacity} chỗ</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {model.price ? `${model.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}
                  </span>
                </div>

                <Tooltip content="Xem thông số kỹ thuật chi tiết và hình ảnh của mẫu xe" placement="top">
                  <Link to={`/car/${model.modelId}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-[#6CA12B] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Xem chi tiết
                    </motion.button>
                  </Link>
                </Tooltip>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section - Only show when there are models */}
        {!loading && !error && models.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Chưa tìm thấy mẫu xe phù hợp?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Liên hệ với đội ngũ tư vấn chuyên nghiệp của chúng tôi để được hỗ trợ 
              tìm kiếm mẫu xe phù hợp nhất với nhu cầu của bạn.
            </p>
            <motion.a
              href="/signin"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block text-center"
            >
              Liên hệ với đại lí 
            </motion.a>
          </div>
        </motion.div>
        )}
      </div>
    </section>
  );
};

export default Models;
