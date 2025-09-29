import React from 'react';
import { motion } from 'framer-motion';

const StatisticsSection = () => {
  const statistics = [
    {
      id: 1,
      label: "SỐ DẶM TÍCH LŨY",
      value: "45.508.797 km",
      description: "Tổng quãng đường di chuyển của tất cả xe điện Electra"
    },
    {
      id: 2,
      label: "GIẢM THIỂU KHÍ CO2",
      value: "206.762.230 kg",
      description: "Lượng khí CO2 đã được giảm thiểu so với xe xăng"
    },
    {
      id: 3,
      label: "LÀM SẠCH KHÔNG KHÍ",
      value: "~2.275.441 cây",
      description: "Tương đương số cây xanh cần thiết để làm sạch không khí"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop"
          alt="Green forest background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tác động{' '}
            <span className="text-green-300">môi trường</span>
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Cùng Electra góp phần bảo vệ môi trường và xây dựng tương lai xanh bền vững
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">
                  {stat.label}
                </h3>
                <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {stat.value}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="border-white/20">
            <h3 className="text-3xl font-bold text-white mb-4">
              Hãy cùng chúng tôi tạo nên sự khác biệt
            </h3>
            <p className="text-gray-200 mb-6 text-lg">
              Mỗi chiếc xe điện Electra không chỉ là phương tiện di chuyển, 
              mà còn là cam kết của bạn với môi trường và tương lai bền vững.
            </p>
           
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;
