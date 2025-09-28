import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Specs = () => {
  const [activeSpec, setActiveSpec] = useState(0);

  const specifications = [
    {
      id: 0,
      title: 'Hiệu suất',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      stats: [
        { label: 'Tốc độ tối đa', value: '200 km/h', description: 'Tốc độ vượt trội so với xe truyền thống' },
        { label: 'Gia tốc 0-100km/h', value: '3.2s', description: 'Gia tốc nhanh như xe đua F1' },
        { label: 'Công suất động cơ', value: '408 HP', description: 'Sức mạnh vượt trội cho mọi tình huống' },
        { label: 'Mô-men xoắn', value: '650 Nm', description: 'Lực kéo mạnh mẽ ngay từ vòng tua thấp' }
      ]
    },
    {
      id: 1,
      title: 'Quãng đường',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      stats: [
        { label: 'Quãng đường tối đa', value: '600 km', description: 'Đủ cho chuyến đi dài không cần sạc' },
        { label: 'Quãng đường thực tế', value: '480 km', description: 'Tính theo điều kiện lái xe thực tế' },
        { label: 'Hiệu suất năng lượng', value: '6.2 km/kWh', description: 'Tiết kiệm năng lượng tối ưu' },
        { label: 'Khả năng tiết kiệm', value: '80%', description: 'Tiết kiệm chi phí so với xăng' }
      ]
    },
    {
      id: 2,
      title: 'Sạc pin',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      stats: [
        { label: 'Sạc nhanh DC', value: '15 phút', description: 'Sạc 80% pin chỉ trong 15 phút' },
        { label: 'Sạc AC tại nhà', value: '8 giờ', description: 'Sạc đầy pin qua đêm tại nhà' },
        { label: 'Công suất sạc DC', value: '150 kW', description: 'Công suất sạc siêu nhanh' },
        { label: 'Mạng lưới trạm sạc', value: '500+', description: 'Trạm sạc trên toàn quốc' }
      ]
    },
    {
      id: 3,
      title: 'Công nghệ',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      stats: [
        { label: 'Hệ thống lái tự động', value: 'Level 3', description: 'Hỗ trợ lái xe tự động cao cấp' },
        { label: 'Màn hình cảm ứng', value: '17 inch', description: 'Màn hình lớn với độ phân giải cao' },
        { label: 'Kết nối 5G', value: 'Có', description: 'Kết nối internet tốc độ cao' },
        { label: 'Cập nhật OTA', value: 'Hàng tháng', description: 'Cập nhật tính năng qua mạng' }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Thông số kỹ thuật{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              nổi bật
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Khám phá những thông số kỹ thuật ấn tượng của dòng xe điện Electra, 
            được thiết kế để mang đến hiệu suất và trải nghiệm lái xe vượt trội.
          </p>
        </motion.div>

        {/* Spec Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {specifications.map((spec, index) => (
            <motion.button
              key={spec.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSpec(spec.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeSpec === spec.id
                  ? `bg-gradient-to-r ${spec.color} text-white shadow-lg`
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <div className={activeSpec === spec.id ? 'text-white' : 'text-gray-400'}>
                {spec.icon}
              </div>
              <span>{spec.title}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Spec Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSpec}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {specifications[activeSpec].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {stat.label}
                    </h3>
                    <span className={`text-2xl font-bold bg-gradient-to-r ${specifications[activeSpec].color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              So sánh với xe truyền thống
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">80%</div>
                <div className="text-gray-300">Tiết kiệm chi phí nhiên liệu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
                <div className="text-gray-300">Khí thải CO2</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-300">Hiệu suất năng lượng</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.a
            href="/signin"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
          >
            Đăng nhập ngay
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Specs;
