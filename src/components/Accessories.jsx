import React from 'react';
import { motion } from 'framer-motion';

const Accessories = () => {
  const accessories = [
    {
      id: 1,
      name: 'Bộ sạc tại nhà',
      description: 'Sạc nhanh và an toàn cho xe điện tại nhà',
      price: '15.000.000 VNĐ',
      image: '🔌'
    },
    {
      id: 2,
      name: 'Dây sạc di động',
      description: 'Dây sạc tiện lợi mang theo mọi nơi',
      price: '2.500.000 VNĐ',
      image: '🔋'
    },
    {
      id: 3,
      name: 'Bộ phụ kiện nội thất',
      description: 'Làm mới không gian nội thất xe',
      price: '8.000.000 VNĐ',
      image: '🚗'
    },
    {
      id: 4,
      name: 'Bảo vệ sơn',
      description: 'Bảo vệ lớp sơn xe khỏi trầy xước',
      price: '12.000.000 VNĐ',
      image: '🛡️'
    }
  ];

  return (
    <section id="accessories" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-bold text-emerald-700 uppercase tracking-wider">
              Phụ kiện
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Phụ kiện{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 bg-clip-text text-transparent">
              chính hãng
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập phụ kiện chính hãng Electra, được thiết kế để nâng cao trải nghiệm lái xe của bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessories.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-emerald-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group"
            >
              <div className="text-6xl mb-4 text-center">{item.image}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {item.description}
              </p>
              <div className="text-lg font-bold text-emerald-600 mb-4">
                {item.price}
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Xem chi tiết
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Accessories;

