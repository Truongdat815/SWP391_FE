import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getAllStoresThunk, getStoresByStatusThunk, getStoresByProvinceThunk, searchStoresThunk } from '../../store/slices/storeSlice';
import DealerCard from '../../components/DealerCard';

const Dealers = () => {
  const dispatch = useDispatch();
  const stores = useSelector((s) => s.stores.items);
  const storesStatus = useSelector((s) => s.stores.status);
  const storesError = useSelector((s) => s.stores.error);
  
  const loading = storesStatus === 'loading';
  const error = storesError;
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Only fetch active stores for the public dealers page
    if (storesStatus === 'idle') {
      dispatch(getStoresByStatusThunk('ACTIVE'));
    }
  }, [dispatch, storesStatus]);

  // Handle search functionality
  const handleSearch = () => {
    if (searchTerm.trim() || selectedProvince) {
      const searchParams = {
        storeName: searchTerm.trim() || undefined,
        provinceName: selectedProvince || undefined
      };
      // Remove undefined values
      Object.keys(searchParams).forEach(key => 
        searchParams[key] === undefined && delete searchParams[key]
      );
      dispatch(searchStoresThunk(searchParams));
    } else {
      dispatch(getStoresByStatusThunk('ACTIVE'));
    }
  };

  const handleProvinceFilter = (province) => {
    setSelectedProvince(province);
    if (province) {
      dispatch(getStoresByProvinceThunk(province));
    } else {
      dispatch(getStoresByStatusThunk('ACTIVE'));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvince('');
    dispatch(getStoresByStatusThunk('ACTIVE'));
  };

  // Get unique provinces for filter dropdown
  const uniqueProvinces = [...new Set(stores.map(store => store.provinceName).filter(Boolean))];

  // Transform store data to match DealerCard component expectations
  const dealers = stores.map(store => ({
    id: store.storeId,
    name: store.storeName,
    address: store.address,
    phone: store.phone,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop", // Default image
    description: `Đại lý chính thức Electra tại ${store.provinceName} với showroom hiện đại và đội ngũ tư vấn chuyên nghiệp.`,
    latitude: getLatitudeForProvince(store.provinceName),
    longitude: getLongitudeForProvince(store.provinceName),
    ownerName: store.ownerName,
    status: store.status
  }));

  // Helper function to get coordinates for provinces
  function getLatitudeForProvince(provinceName) {
    const coordinates = {
      'Hà Nội': 21.0285,
      'TP.HCM': 10.7769,
      'Đà Nẵng': 16.0544,
      'Cần Thơ': 10.0452,
      'Hải Phòng': 20.8449,
      'Nha Trang': 12.2388,
      'Hồ Chí Minh': 10.7769
    };
    return coordinates[provinceName] || 21.0285; // Default to Hanoi
  }

  function getLongitudeForProvince(provinceName) {
    const coordinates = {
      'Hà Nội': 105.8542,
      'TP.HCM': 106.7009,
      'Đà Nẵng': 108.2022,
      'Cần Thơ': 105.7469,
      'Hải Phòng': 106.6881,
      'Nha Trang': 109.1967,
      'Hồ Chí Minh': 106.7009
    };
    return coordinates[provinceName] || 105.8542; // Default to Hanoi
  }

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
    console.log('Error loading stores:', error);
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
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Khám phá các đại lý chính thức của Electra trên toàn quốc. 
              Tìm đại lý gần nhất để trải nghiệm và sở hữu xe điện Electra.
            </p>
            
            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo tên đại lý..."
                        className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-green-200 focus:ring-2 focus:ring-green-300 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select 
                      className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-green-300 focus:border-transparent"
                      value={selectedProvince}
                      onChange={(e) => handleProvinceFilter(e.target.value)}
                    >
                      <option value="" className="text-gray-800">Tất cả khu vực</option>
                      {uniqueProvinces.map(province => (
                        <option key={province} value={province} className="text-gray-800">{province}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg transition flex items-center font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Tìm kiếm
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition flex items-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Search Results Info */}
                {(searchTerm || selectedProvince) && (
                  <div className="mt-4 text-center">
                    <p className="text-green-100 text-sm">
                      {searchTerm && selectedProvince 
                        ? `Tìm kiếm "${searchTerm}" tại ${selectedProvince}`
                        : searchTerm 
                        ? `Tìm kiếm "${searchTerm}"`
                        : `Lọc theo khu vực: ${selectedProvince}`
                      }
                      <span className="ml-2 text-green-200">({dealers.length} kết quả)</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Results Header */}
        {(searchTerm || selectedProvince) && dealers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kết quả tìm kiếm
              </h2>
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-green-600">{dealers.length}</span> đại lý
                {searchTerm && ` cho "${searchTerm}"`}
                {selectedProvince && ` tại ${selectedProvince}`}
              </p>
            </div>
          </motion.div>
        )}

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

        {dealers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || selectedProvince ? 'Không tìm thấy đại lý nào' : 'Chưa có đại lý nào'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedProvince 
                ? 'Không có đại lý nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.'
                : 'Hiện tại chưa có đại lý nào được liệt kê. Vui lòng quay lại sau.'
              }
            </p>
            {(searchTerm || selectedProvince) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Xem tất cả đại lý
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dealers;
