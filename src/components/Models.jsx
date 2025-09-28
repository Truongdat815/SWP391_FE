import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import vehicle images
import electraAscent from '../assets/images/electra ascent.png';
import electraCitylink from '../assets/images/electra citylink poster.png';
import electraGrandtour from '../assets/images/electra grandtour.png';
import electraMicro from '../assets/images/electra micro.png';
import electraSummit from '../assets/images/electra summit.png';
import electraVelocity from '../assets/images/electra velocity.png';
import electraUrbanpluse from '../assets/images/electra urbanpluse.png';
import electraVoyager from '../assets/images/electra voyager.png';

const Models = () => {
  const vehicles = [
    {
      id: 'electra-ascent',
      name: 'Electra Ascent',
      image: electraAscent,
      price: '320.000.000',
      category: 'SUV Cao cấp',
      description: 'Luxury SUV với công nghệ tiên tiến và thiết kế sang trọng',
      features: ['Pin 70kWh', 'Quãng đường 380km', 'Sạc nhanh 25 phút']
    },
    {
      id: 'electra-citylink',
      name: 'Electra CityLink',
      image: electraCitylink,
      price: '280.000.000',
      category: 'Xe đô thị',
      description: 'Xe điện thông minh cho thành phố với thiết kế nhỏ gọn',
      features: ['Pin 55kWh', 'Quãng đường 320km', 'Sạc nhanh 20 phút']
    },
    {
      id: 'electra-grandtour',
      name: 'Electra GrandTour',
      image: electraGrandtour,
      price: '450.000.000',
      category: 'Xe gia đình',
      description: 'Xe điện cao cấp cho gia đình với không gian rộng rãi',
      features: ['Pin 80kWh', 'Quãng đường 420km', 'Sạc nhanh 22 phút']
    },
    {
      id: 'electra-micro',
      name: 'Electra Micro',
      image: electraMicro,
      price: '180.000.000',
      category: 'Xe nhỏ gọn',
      description: 'Xe điện nhỏ gọn, tiện lợi cho di chuyển trong thành phố',
      features: ['Pin 35kWh', 'Quãng đường 200km', 'Sạc nhanh 15 phút']
    },
    {
      id: 'electra-summit',
      name: 'Electra Summit',
      image: electraSummit,
      price: '680.000.000',
      category: 'SUV Thể thao',
      description: 'Xe điện thể thao mạnh mẽ với hiệu suất vượt trội',
      features: ['Pin 90kWh', 'Quãng đường 450km', 'Sạc nhanh 18 phút']
    },
    {
      id: 'electra-velocity',
      name: 'Electra Velocity',
      image: electraVelocity,
      price: '850.000.000',
      category: 'Xe tốc độ',
      description: 'Xe điện tốc độ cao với công nghệ đua xe',
      features: ['Pin 100kWh', 'Quãng đường 500km', 'Sạc nhanh 15 phút']
    },
    {
      id: 'electra-urbanpluse',
      name: 'Electra UrbanPulse',
      image: electraUrbanpluse,
      price: '220.000.000',
      category: 'Xe năng động',
      description: 'Xe điện năng động cho giới trẻ với thiết kế hiện đại',
      features: ['Pin 45kWh', 'Quãng đường 280km', 'Sạc nhanh 18 phút']
    },
    {
      id: 'electra-voyager',
      name: 'Electra Voyager',
      image: electraVoyager,
      price: '750.000.000',
      category: 'Xe phiêu lưu',
      description: 'Xe điện phiêu lưu, khám phá với khả năng off-road',
      features: ['Pin 85kWh', 'Quãng đường 400km', 'Sạc nhanh 20 phút']
    }
  ];

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
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Electra
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện đa dạng, từ xe đô thị nhỏ gọn đến SUV cao cấp, 
            tất cả đều được thiết kế để mang đến trải nghiệm lái xe tuyệt vời.
          </p>
        </motion.div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-contain object-center"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {vehicle.category}
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
                        {vehicle.features.map((feature, idx) => (
                          <span key={idx} className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {vehicle.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {vehicle.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {vehicle.price} VNĐ
                  </span>
                </div>

                <Link to={`/car/${vehicle.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Xem chi tiết
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
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
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block text-center"
            >
              Đăng nhập
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Models;
