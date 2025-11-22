import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Facebook, Twitter, Instagram, ShoppingBag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useCreateAppointmentMutation } from '../../../api/public/appointmentApi';
import { useGetAllModelsQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetAllModelColorsQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetAllColorsQuery } from '../../../api/dealerStaff/vehicleApi';

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    modelId: null,
  });
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  // API calls để lấy dữ liệu xe
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: modelColorsData, isLoading: isLoadingModelColors, error: modelColorsError } = useGetAllModelColorsQuery();
  const { data: colorsData, error: colorsError } = useGetAllColorsQuery();

  // Xử lý dữ liệu từ API - format giống các file khác: { data: [...] } hoặc RTK Query wrap
  // Debug logs để kiểm tra cấu trúc response
  console.log('=== API RESPONSE DEBUG ===');
  console.log('modelsData:', modelsData);
  console.log('modelsData type:', typeof modelsData);
  console.log('modelsData?.data:', modelsData?.data);
  console.log('modelsData?.data type:', typeof modelsData?.data);
  console.log('Is modelsData?.data array?', Array.isArray(modelsData?.data));
  console.log('modelColorsData:', modelColorsData);
  console.log('modelColorsData type:', typeof modelColorsData);
  console.log('modelColorsData?.data:', modelColorsData?.data);
  console.log('modelColorsData?.data type:', typeof modelColorsData?.data);
  console.log('Is modelColorsData?.data array?', Array.isArray(modelColorsData?.data));
  console.log('colorsData:', colorsData);
  console.log('colorsData?.data:', colorsData?.data);
  console.log('Is colorsData?.data array?', Array.isArray(colorsData?.data));
  
  // Kiểm tra nhiều cấu trúc có thể có - giống ProductsPage
  const models = useMemo(() => {
    if (!modelsData) {
      console.log('modelsData is null/undefined');
      return [];
    }
    console.log('Checking modelsData structure...');
    // Format 1: { data: [...] } - format phổ biến nhất
    if (Array.isArray(modelsData.data)) {
      console.log('Found models in modelsData.data');
      return modelsData.data;
    }
    // Format 2: { data: { data: [...] } } - nested
    if (modelsData.data?.data && Array.isArray(modelsData.data.data)) {
      console.log('Found models in modelsData.data.data');
      return modelsData.data.data;
    }
    // Format 3: Direct array
    if (Array.isArray(modelsData)) {
      console.log('modelsData is direct array');
      return modelsData;
    }
    console.log('No models found in any structure');
    return [];
  }, [modelsData]);

  const modelColors = useMemo(() => {
    if (!modelColorsData) {
      console.log('modelColorsData is null/undefined');
      return [];
    }
    console.log('Checking modelColorsData structure...');
    // Format 1: { data: [...] }
    if (Array.isArray(modelColorsData.data)) {
      console.log('Found modelColors in modelColorsData.data');
      return modelColorsData.data;
    }
    // Format 2: { data: { data: [...] } }
    if (modelColorsData.data?.data && Array.isArray(modelColorsData.data.data)) {
      console.log('Found modelColors in modelColorsData.data.data');
      return modelColorsData.data.data;
    }
    // Format 3: Direct array
    if (Array.isArray(modelColorsData)) {
      console.log('modelColorsData is direct array');
      return modelColorsData;
    }
    console.log('No modelColors found in any structure');
    return [];
  }, [modelColorsData]);

  const colors = useMemo(() => {
    if (!colorsData) return [];
    // Format 1: { data: [...] }
    if (Array.isArray(colorsData.data)) return colorsData.data;
    // Format 2: { data: { data: [...] } }
    if (colorsData.data?.data && Array.isArray(colorsData.data.data)) return colorsData.data.data;
    // Format 3: Direct array
    if (Array.isArray(colorsData)) return colorsData;
    return [];
  }, [colorsData]);
  
  console.log('Parsed - Models:', models.length, 'ModelColors:', modelColors.length, 'Colors:', colors.length);
  if (models.length > 0) console.log('Models sample:', models[0]);
  if (modelColors.length > 0) console.log('ModelColors sample:', modelColors[0]);

  // Helper function để xử lý image URL (thêm base URL nếu cần)
  const getImageUrl = useMemo(() => {
    return (url) => {
      if (!url) return null;
      // Nếu URL đã là full URL (bắt đầu với http:// hoặc https://), trả về nguyên
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Nếu URL bắt đầu với /, nối với base API URL
      if (url.startsWith('/')) {
        const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://tiembanhvuive.io.vn/api');
        return `${baseUrl.replace(/\/api$/, '')}${url}`;
      }
      // Nếu là relative path, nối với base API URL
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://tiembanhvuive.io.vn/api');
      return `${baseUrl.replace(/\/api$/, '')}/${url}`;
    };
  }, []);

  // Tạo map để lấy hình ảnh và giá cho mỗi model
  const modelImageMap = useMemo(() => {
    const map = new Map();
    console.log('Model Colors Data:', modelColors);
    modelColors.forEach((mc) => {
      if (!map.has(mc.modelId)) {
        // Lấy hình ảnh đầu tiên tìm thấy cho model này
        // Kiểm tra tất cả các field có thể chứa image URL
        const rawImageUrl = mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile || mc.imageUrlPath;
        const imageUrl = getImageUrl(rawImageUrl);
        console.log(`Model ${mc.modelId} - Image fields:`, {
          rawImageUrl,
          processedImageUrl: imageUrl,
          allFields: {
            imageUrl: mc.imageUrl,
            image: mc.image,
            imagePath: mc.imagePath,
            imageFileUrl: mc.imageFileUrl,
            imageFile: mc.imageFile,
            imageUrlPath: mc.imageUrlPath,
          }
        });
        map.set(mc.modelId, {
          imageUrl: imageUrl,
          price: mc.price,
          colorId: mc.colorId,
        });
      }
    });
    console.log('Model Image Map:', Array.from(map.entries()));
    return map;
  }, [modelColors]);

  // Tạo danh sách products từ API
  const products = useMemo(() => {
    console.log('=== DEBUG PRODUCTS ===');
    console.log('Models raw:', models);
    console.log('Models length:', models.length);
    console.log('ModelColors:', modelColors);
    console.log('Colors:', colors);
    
    if (!Array.isArray(models) || models.length === 0) {
      console.log('No models found:', { models, modelsData, modelsError });
      return [];
    }
    
    // Hiển thị TẤT CẢ models, không filter theo status
    // Chỉ filter nếu status là INACTIVE hoặc DELETED
    const filtered = models.filter((model) => {
      // Bỏ qua các model bị xóa hoặc không hoạt động
      if (model.status === 'INACTIVE' || model.status === 'DELETED' || model.status === 'DISABLED') {
        return false;
      }
      return true; // Hiển thị tất cả các model khác (ACTIVE, null, undefined, etc.)
    });
    
    console.log('Models after filter:', filtered.length);
    
    const productsList = filtered.map((model) => {
        const modelInfo = modelImageMap.get(model.modelId);
        const modelColorList = modelColors.filter((mc) => mc.modelId === model.modelId);
        const firstColor = modelColorList.length > 0 
          ? colors.find((c) => c.colorId === modelColorList[0].colorId)
          : null;

        const product = {
          id: model.modelId,
          modelId: model.modelId,
          name: model.modelName,
          type: model.bodyType || 'SEDAN',
          year: model.modelYear?.toString() || '2025',
          color: firstColor?.colorName || 'Đen',
          colorClass: firstColor?.hexCode ? `bg-[${firstColor.hexCode}]` : 'bg-gray-900',
          battery: model.batteryCapacity ? `${model.batteryCapacity} kWh` : 'N/A',
          range: model.range ? `${model.range} km` : 'N/A',
          power: model.powerHp ? `${model.powerHp} HP` : 'N/A',
          torque: model.torqueNm ? `${model.torqueNm} Nm` : 'N/A',
          acceleration: model.acceleration ? `${model.acceleration}s` : 'N/A',
          seats: model.seatingCapacity ? `${model.seatingCapacity} chỗ` : 'N/A',
          imageUrl: modelInfo?.imageUrl,
          price: modelInfo?.price,
          imageBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
        };
        console.log(`Product ${product.name}:`, { imageUrl: product.imageUrl, price: product.price });
        return product;
      });
    
    console.log('Final Products:', productsList);
    return productsList;
  }, [models, modelColors, colors, modelImageMap]);

  // Auto-play carousel
  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(formData).unwrap();
      alert('Đăng ký lái thử thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        preferredDate: '',
        preferredTime: '',
        modelId: null,
      });
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error(error);
    }
  };

  // Tạo hero slides từ products (lấy 5 sản phẩm đầu tiên)
  const heroSlides = useMemo(() => {
    return products.slice(0, 5).map((product, index) => {
      // Tạo tagline và description dựa trên body type
      let tagline = '';
      let description = '';
      
      switch (product.type) {
        case 'SUV':
          tagline = 'Luxury SUV với công nghệ tiên tiến';
          description = 'Trải nghiệm sang trọng và hiện đại với dòng SUV điện cao cấp';
          break;
        case 'SEDAN':
          tagline = 'Xe điện cao cấp cho gia đình';
          description = 'Không gian rộng rãi và tiện nghi cho mọi hành trình gia đình';
          break;
        case 'HATCHBACK':
          tagline = 'Xe điện năng động cho giới trẻ';
          description = 'Phong cách năng động, phù hợp với lối sống hiện đại';
          break;
        case 'COUPE':
          tagline = 'Xe điện thể thao, hiệu suất cao';
          description = 'Thiết kế thể thao với hiệu suất vượt trội';
          break;
        case 'WAGON':
          tagline = 'Xe điện đa dụng cho mọi nhu cầu';
          description = 'Không gian rộng rãi, linh hoạt cho mọi hành trình';
          break;
        default:
          tagline = 'Xe điện thông minh cho thành phố';
          description = 'Giải pháp di chuyển thông minh cho cuộc sống đô thị hiện đại';
      }
      
      return {
        id: product.id,
        badge: 'XE ĐIỆN TƯƠNG LAI',
        title: product.name,
        tagline: tagline,
        description: description,
        carColor: product.imageBg,
        bgGradient: 'from-gray-900 via-gray-800 to-gray-900',
        imageUrl: product.imageUrl,
      };
    });
  }, [products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-2xl font-bold text-white">Electra</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white hover:text-green-400 transition-colors font-medium">
                Trang chủ
              </a>
              <a href="#products" className="text-white hover:text-green-400 transition-colors font-medium">
                Dòng xe
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors font-medium">
                Phụ kiện
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors font-medium">
                Trạm sạc
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors font-medium">
                Đại lý
              </a>
              <Button
                onClick={() => navigate('/login')}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Đăng nhập
              </Button>
            </nav>

            {/* Mobile Login Button */}
            <Button
              onClick={() => navigate('/login')}
              className="md:hidden bg-green-600 hover:bg-green-700 text-white"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section với Carousel */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {isLoadingModels || isLoadingModelColors ? (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-2xl mb-4">Đang tải dữ liệu...</div>
            </div>
          </div>
        ) : (modelsError || modelColorsError) ? (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">Lỗi khi tải dữ liệu</div>
              <div className="text-gray-400 text-sm">Vui lòng thử lại sau</div>
            </div>
          </div>
        ) : heroSlides.length === 0 ? (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Electra
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
                Xe điện tương lai
              </p>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto mb-8">
                Khám phá bộ sưu tập xe điện đa dạng, từ xe đô thị nhỏ gọn đến SUV cao cấp
              </p>
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              >
                Khám phá ngay
                <ArrowRight className="ml-2" size={24} />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
            {/* Background với hiệu ứng */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}>
              {/* Light trails effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/4 w-1 h-32 bg-green-500/30 blur-sm animate-pulse"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-40 bg-green-400/40 blur-sm animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="absolute bottom-0 right-1/4 w-1 h-28 bg-green-500/30 blur-sm animate-pulse" style={{ animationDelay: '700ms' }}></div>
              </div>
            </div>

            {/* Content - Layout 2 cột */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-20">
                {/* Left Column - Text Content */}
                <div className="space-y-6 text-left">
                  <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-full">
                    <span className="text-green-400 text-sm font-semibold">{slide.badge}</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-2xl md:text-3xl font-bold text-green-400">
                    {slide.tagline}
                  </p>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
                    {slide.description}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg mt-6"
                  >
                    Khám phá ngay
                    <ArrowRight className="ml-2" size={24} />
                  </Button>
                </div>

                {/* Right Column - Car Image */}
                <div className="relative h-full flex items-center justify-center">
                  <div className={`relative w-full h-96 ${slide.carColor} rounded-2xl shadow-2xl transform transition-transform duration-1000 overflow-hidden ${index === currentSlide ? 'scale-100' : 'scale-95'}`}>
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback nếu hình ảnh lỗi
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Car placeholder - hiển thị khi không có hình ảnh */}
                    <div className={`absolute inset-0 flex items-center justify-center ${slide.imageUrl ? 'hidden' : 'flex'}`}>
                      <div className="text-white text-6xl font-bold opacity-30">
                        {slide.title.split(' ')[1]?.charAt(0) || 'E'}
                      </div>
                    </div>
                    {/* Car shadow effect */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-black/30 blur-xl rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            ))}
          </>
        )}

        {/* Carousel Navigation - chỉ hiển thị khi có slides */}
        {heroSlides.length > 0 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            {/* Dots indicator */}
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-green-500 w-8'
                      : 'bg-gray-600 hover:bg-gray-500 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-full mb-4">
              <span className="text-green-400 text-sm font-semibold">SẢN PHẨM</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Dòng xe Electra
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Khám phá bộ sưu tập xe điện đa dạng, từ xe đô thị nhỏ gọn đến SUV cao cấp, tất cả đều được thiết kế để mang đến trải nghiệm lái xe tuyệt vời.
            </p>
          </div>

          {/* Products Grid */}
          {isLoadingModels || isLoadingModelColors ? (
            <div className="text-center py-12">
              <div className="text-white text-lg">Đang tải sản phẩm...</div>
            </div>
          ) : (modelsError || modelColorsError) ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-2">Lỗi khi tải dữ liệu</div>
              <div className="text-gray-600 text-sm mb-2">Vui lòng thử lại sau</div>
              <div className="text-gray-500 text-xs bg-gray-100 p-3 rounded mt-4 max-w-2xl mx-auto">
                {modelsError && <div>Models Error: {JSON.stringify(modelsError, null, 2)}</div>}
                {modelColorsError && <div>ModelColors Error: {JSON.stringify(modelColorsError, null, 2)}</div>}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-900 text-lg mb-2">Chưa có sản phẩm nào</div>
              <div className="text-gray-600 text-sm mb-4">Vui lòng quay lại sau</div>
              <div className="text-gray-500 text-xs bg-gray-100 p-3 rounded mt-4 max-w-2xl mx-auto">
                <div className="font-semibold mb-2">Debug Info:</div>
                <div>Models: {models.length} | ModelColors: {modelColors.length} | Colors: {colors.length}</div>
                <div className="mt-2 text-left space-y-1">
                  <div>modelsData: {modelsData ? 'exists' : 'null'} {modelsData && `(type: ${typeof modelsData})`}</div>
                  <div>modelColorsData: {modelColorsData ? 'exists' : 'null'} {modelColorsData && `(type: ${typeof modelColorsData})`}</div>
                  <div>colorsData: {colorsData ? 'exists' : 'null'} {colorsData && `(type: ${typeof colorsData})`}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-200 group"
              >
                {/* Image Section */}
                <div className={`relative h-64 bg-white overflow-hidden`}>
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <span className="px-3 py-1 bg-gray-800/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                      {product.type}
                    </span>
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 text-xs font-semibold flex items-center gap-1 border border-gray-200">
                      <span className={`w-3 h-3 rounded-full ${product.colorClass}`}></span>
                      {product.color}
                    </span>
                  </div>
                  {/* Car Image */}
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback nếu hình ảnh lỗi
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Car placeholder - hiển thị khi không có hình ảnh */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${product.imageUrl ? 'hidden' : 'flex'}`}>
                    <div className="text-gray-400 text-5xl font-bold opacity-30">
                      {product.name.split(' ')[1]?.charAt(0) || 'E'}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Model {product.year} • {product.type}
                  </p>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Pin</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.battery}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Quãng đường</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.range}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Công suất</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.power}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Mô-men xoắn</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.torque}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tăng tốc (0-100km/h)</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.acceleration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Số chỗ ngồi</p>
                      <p className="text-gray-900 font-semibold text-sm">{product.seats}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => navigate(`/model/${product.modelId}`)}
                    >
                      Xem chi tiết
                    </Button>
                    <button className="w-12 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors">
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Logo & Tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <span className="text-2xl font-bold text-white">Electra</span>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Dẫn đầu kỷ nguyên di chuyển bằng điện.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            {/* Khám phá */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Khám phá</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#products" className="text-gray-400 hover:text-green-400 transition-colors">
                    Dòng xe
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    Phụ kiện
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    Trạm sạc
                  </a>
                </li>
              </ul>
            </div>

            {/* Về Electra */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Về Electra</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    Về Chúng Tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    Chính sách
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Đăng ký nhận tin</h4>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2024 Electra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Test Drive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký Lái thử"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Ngày mong muốn"
            type="date"
            value={formData.preferredDate}
            onChange={(e) =>
              setFormData({ ...formData, preferredDate: e.target.value })
            }
            required
          />
          <Input
            label="Giờ mong muốn"
            type="time"
            value={formData.preferredTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
