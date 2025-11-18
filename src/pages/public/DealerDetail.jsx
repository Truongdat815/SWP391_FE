import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL, buildUrl } from '@/api/client';

const DealerDetail = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = buildUrl(API_URL, '/api/stores/all');
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dealer details');
        }
        
        const data = await response.json();
        const stores = data.data || data;
        const store = stores.find(s => s.storeId === parseInt(id));
        
        if (store) {
          // Transform store to dealer format
          setDealer({
            id: store.storeId,
            storeId: store.storeId,
            name: store.storeName,
            address: store.address,
            phone: store.phone,
            image: store.imagePath || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: `Đại lý chính thức Electra tại ${store.provinceName} với showroom hiện đại và đội ngũ tư vấn chuyên nghiệp.`,
            ownerName: store.ownerName,
            provinceName: store.provinceName,
            status: store.status
          });
        } else {
          throw new Error('Store not found');
        }
      } catch (err) {
        setError(err.message);
        // Fallback data if API is not available
        const fallbackDealers = [
          {
            id: 1,
            name: "Electra Hà Nội",
            address: "123 Đường Láng, Đống Đa, Hà Nội",
            phone: "024 1234 5678",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Đại lý chính thức Electra tại Hà Nội với showroom hiện đại và đội ngũ tư vấn chuyên nghiệp. Chúng tôi cung cấp đầy đủ các dịch vụ từ tư vấn, bán hàng, bảo hành đến sửa chữa cho tất cả các dòng xe điện Electra.",
            latitude: 21.0285,
            longitude: 105.8542
          },
          {
            id: 2,
            name: "Electra TP.HCM",
            address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
            phone: "028 9876 5432",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Showroom Electra lớn nhất tại TP.HCM với đầy đủ các dòng xe và dịch vụ bảo hành. Đội ngũ nhân viên giàu kinh nghiệm sẵn sàng tư vấn và hỗ trợ khách hàng 24/7.",
            latitude: 10.7769,
            longitude: 106.7009
          },
          {
            id: 3,
            name: "Electra Đà Nẵng",
            address: "789 Lê Duẩn, Hải Châu, Đà Nẵng",
            phone: "0236 5555 7777",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Đại lý Electra tại miền Trung với không gian trưng bày rộng rãi và dịch vụ khách hàng tận tâm. Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.",
            latitude: 16.0544,
            longitude: 108.2022
          },
          {
            id: 4,
            name: "Electra Cần Thơ",
            address: "321 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
            phone: "0292 3333 9999",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Đại lý Electra tại Đồng bằng sông Cửu Long với đội ngũ kỹ thuật giàu kinh nghiệm. Chúng tôi cung cấp dịch vụ bảo dưỡng và sửa chữa chuyên nghiệp cho tất cả các dòng xe Electra.",
            latitude: 10.0452,
            longitude: 105.7469
          },
          {
            id: 5,
            name: "Electra Hải Phòng",
            address: "654 Lê Lợi, Ngô Quyền, Hải Phòng",
            phone: "0225 7777 8888",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Showroom Electra tại thành phố cảng với dịch vụ bảo dưỡng và sửa chữa chuyên nghiệp. Đội ngũ kỹ thuật viên được đào tạo bài bản và có chứng chỉ từ Electra.",
            latitude: 20.8449,
            longitude: 106.6881
          },
          {
            id: 6,
            name: "Electra Nha Trang",
            address: "987 Trần Phú, Lộc Thọ, Nha Trang",
            phone: "0258 2222 4444",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            description: "Đại lý Electra tại thành phố biển với không gian showroom thoáng mát và view đẹp. Chúng tôi mang đến trải nghiệm mua sắm thú vị và dịch vụ chăm sóc khách hàng chu đáo.",
            latitude: 12.2388,
            longitude: 109.1967
          }
        ];
        
        const foundDealer = fallbackDealers.find(d => d.id === parseInt(id));
        if (foundDealer) {
          setDealer(foundDealer);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDealer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đại lý...</p>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Không tìm thấy đại lý
          </h3>
          <p className="text-gray-500 mb-6">
            Đại lý bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/dealers"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </Link>
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
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/dealers"
              className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách đại lý
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dealer.name}
            </h1>
            <p className="text-xl text-green-100 max-w-3xl">
              {dealer.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Dealer Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
              <img
                src={dealer.image}
                alt={dealer.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Dealer Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin liên hệ
              </h2>
              
              <div className="space-y-4">
                {dealer.storeId && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mã cửa hàng</h3>
                      <p className="text-gray-600 font-mono">#{dealer.storeId}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Địa chỉ</h3>
                    <p className="text-gray-600">{dealer.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Số điện thoại</h3>
                    <a 
                      href={`tel:${dealer.phone}`}
                      className="text-green-600 hover:text-green-700 transition-colors duration-200"
                    >
                      {dealer.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Dịch vụ cung cấp
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Tư vấn và bán hàng</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Bảo hành chính hãng</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Sửa chữa và bảo dưỡng</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Thay thế phụ tùng</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Test drive miễn phí</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Hỗ trợ tài chính</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vị trí đại lý
            </h2>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgU6xI1dHhY&q=${dealer.latitude},${dealer.longitude}&zoom=15`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Bản đồ ${dealer.name}`}
              ></iframe>
            </div>
            
            <div className="mt-4 text-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${dealer.latitude},${dealer.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Mở trong Google Maps
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DealerDetail;
