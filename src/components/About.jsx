import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const stats = [
    { value: '500+', label: 'Xe đã bàn giao', icon: '🚗' },
    { value: '45M+', label: 'Km đã di chuyển', icon: '📊' },
    { value: '98%', label: 'Khách hàng hài lòng', icon: '⭐' },
  ];

  const highlights = [
    {
      title: 'Pin sạc nhanh',
      detail: '30 phút đạt 80%',
      description: 'Công nghệ sạc nhanh DC cho phép sạc từ 0-80% chỉ trong 30 phút',
    },
    {
      title: 'An toàn 5 sao',
      detail: 'Euro NCAP',
      description: 'Đạt chuẩn an toàn 5 sao với hệ thống hỗ trợ lái xe thông minh',
    },
    {
      title: 'Thiết kế tối ưu',
      detail: 'Aerodynamic',
      description: 'Hệ số cản gió thấp giúp tăng hiệu suất và giảm tiêu thụ năng lượng',
    },
    {
      title: 'Zero Emission',
      detail: '100% điện',
      description: 'Không phát thải, góp phần giảm thiểu ô nhiễm môi trường',
    },
  ];

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">
              Về chúng tôi
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Electra
            <span className="block text-3xl md:text-4xl font-normal text-gray-600 mt-2">
              Di chuyển thông minh cho tương lai
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Từ năm 2020, Electra đã mang đến giải pháp di chuyển xanh cho người Việt. 
            Với công nghệ pin tiên tiến và thiết kế tối ưu, mỗi chiếc xe là bước tiến 
            hướng tới tương lai bền vững.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-6 md:gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                    {item.detail}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Khám phá công nghệ</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;