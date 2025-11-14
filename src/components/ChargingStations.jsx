import React from 'react';
import { motion } from 'framer-motion';

const ChargingStations = () => {
  const stations = [
    {
      id: 1,
      name: 'Trạm sạc TP.HCM',
      location: 'Quận 1, TP.HCM',
      type: 'DC Fast Charging',
      slots: 8,
      status: 'Hoạt động'
    },
    {
      id: 2,
      name: 'Trạm sạc Hà Nội',
      location: 'Quận Cầu Giấy, Hà Nội',
      type: 'DC Fast Charging',
      slots: 6,
      status: 'Hoạt động'
    },
    {
      id: 3,
      name: 'Trạm sạc Đà Nẵng',
      location: 'Quận Hải Châu, Đà Nẵng',
      type: 'AC Standard',
      slots: 4,
      status: 'Hoạt động'
    },
    {
      id: 4,
      name: 'Trạm sạc Cần Thơ',
      location: 'Quận Ninh Kiều, Cần Thơ',
      type: 'DC Fast Charging',
      slots: 4,
      status: 'Sắp mở'
    }
  ];

  return (
    <section id="charging" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
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
              Trạm sạc
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Mạng lưới{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 bg-clip-text text-transparent">
              trạm sạc
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tìm trạm sạc gần nhất và sạc nhanh cho xe điện của bạn với mạng lưới trạm sạc rộng khắp
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stations.map((station, index) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-emerald-300/60 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {station.name}
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {station.location}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  station.status === 'Hoạt động' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {station.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-gray-600 mb-1">Loại sạc</div>
                  <div className="font-semibold text-slate-900">{station.type}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-gray-600 mb-1">Số chỗ sạc</div>
                  <div className="font-semibold text-slate-900">{station.slots} chỗ</div>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Xem trên bản đồ
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 rounded-xl text-white font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
            Xem tất cả trạm sạc
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ChargingStations;

