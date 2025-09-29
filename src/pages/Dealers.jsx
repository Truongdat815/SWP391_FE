import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DealerCard from '../components/DealerCard';

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/dealers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dealers');
        }
        
        const data = await response.json();
        setDealers(data);
      } catch (err) {
        setError(err.message);
        // Fallback data if API is not available
        setDealers([
          {
            id: 1,
            name: "Electra Hà Nội",
            address: "123 Đường Láng, Đống Đa, Hà Nội",
            phone: "024 1234 5678",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Đại lý chính thức Electra tại Hà Nội với showroom hiện đại và đội ngũ tư vấn chuyên nghiệp.",
            latitude: 21.0285,
            longitude: 105.8542
          },
          {
            id: 2,
            name: "Electra TP.HCM",
            address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
            phone: "028 9876 5432",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Showroom Electra lớn nhất tại TP.HCM với đầy đủ các dòng xe và dịch vụ bảo hành.",
            latitude: 10.7769,
            longitude: 106.7009
          },
          {
            id: 3,
            name: "Electra Đà Nẵng",
            address: "789 Lê Duẩn, Hải Châu, Đà Nẵng",
            phone: "0236 5555 7777",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Đại lý Electra tại miền Trung với không gian trưng bày rộng rãi và dịch vụ khách hàng tận tâm.",
            latitude: 16.0544,
            longitude: 108.2022
          },
          {
            id: 4,
            name: "Electra Cần Thơ",
            address: "321 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
            phone: "0292 3333 9999",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Đại lý Electra tại Đồng bằng sông Cửu Long với đội ngũ kỹ thuật giàu kinh nghiệm.",
            latitude: 10.0452,
            longitude: 105.7469
          },
          {
            id: 5,
            name: "Electra Hải Phòng",
            address: "654 Lê Lợi, Ngô Quyền, Hải Phòng",
            phone: "0225 7777 8888",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Showroom Electra tại thành phố cảng với dịch vụ bảo dưỡng và sửa chữa chuyên nghiệp.",
            latitude: 20.8449,
            longitude: 106.6881
          },
          {
            id: 6,
            name: "Electra Nha Trang",
            address: "987 Trần Phú, Lộc Thọ, Nha Trang",
            phone: "0258 2222 4444",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
            description: "Đại lý Electra tại thành phố biển với không gian showroom thoáng mát và view đẹp.",
            latitude: 12.2388,
            longitude: 109.1967
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đại lý...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Using fallback data due to API error:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Mạng lưới đại lý{' '}
              <span className="text-green-200">Electra</span>
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Khám phá các đại lý chính thức của Electra trên toàn quốc. 
              Tìm đại lý gần nhất để trải nghiệm và sở hữu xe điện Electra.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {dealers.map((dealer, index) => (
            <motion.div
              key={dealer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DealerCard dealer={dealer} />
            </motion.div>
          ))}
        </motion.div>

        {dealers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có đại lý nào
            </h3>
            <p className="text-gray-500">
              Hiện tại chưa có đại lý nào được liệt kê. Vui lòng quay lại sau.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dealers;
