import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DealerCard = ({ dealer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={dealer.image}
          alt={dealer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {dealer.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600 text-sm leading-relaxed">
              {dealer.address}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-gray-600 text-sm">
              {dealer.phone}
            </p>
          </div>
        </div>
        
        <Link
          to={`/dealers/${dealer.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Xem chi tiết
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default DealerCard;
