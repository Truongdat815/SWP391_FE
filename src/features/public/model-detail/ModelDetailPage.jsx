import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, Battery, Gauge, Zap, Users, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useGetAllModelsQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetAllModelColorsQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetAllColorsQuery } from '../../../api/dealerStaff/vehicleApi';

const ModelDetailPage = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // API calls
  const { data: modelsData, isLoading: isLoadingModel } = useGetAllModelsQuery();
  const { data: modelColorsData, isLoading: isLoadingModelColors } = useGetAllModelColorsQuery();
  const { data: colorsData } = useGetAllColorsQuery();

  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];
  const colors = Array.isArray(colorsData?.data) ? colorsData.data : [];

  // Tìm model theo ID
  const model = useMemo(() => {
    return models.find((m) => m.modelId === parseInt(modelId));
  }, [models, modelId]);

  // Lấy danh sách model colors cho model này
  const modelColorList = useMemo(() => {
    if (!model) return [];
    return modelColors.filter((mc) => mc.modelId === model.modelId);
  }, [modelColors, model]);

  // Lấy danh sách màu sắc với hình ảnh
  const colorListWithImages = useMemo(() => {
    return modelColorList.map((mc) => {
      const color = colors.find((c) => c.colorId === mc.colorId);
      const imageUrl = mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile || mc.imageUrlPath;
      
      // Xử lý image URL (thêm base URL nếu cần)
      let processedImageUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://tiembanhvuive.io.vn/api');
        processedImageUrl = imageUrl.startsWith('/') 
          ? `${baseUrl.replace(/\/api$/, '')}${imageUrl}`
          : `${baseUrl.replace(/\/api$/, '')}/${imageUrl}`;
      }

      return {
        colorId: mc.colorId,
        colorName: color?.colorName || 'N/A',
        hexCode: color?.hexCode || '#000000',
        imageUrl: processedImageUrl,
        modelColor: mc,
      };
    });
  }, [modelColorList, colors]);

  if (isLoadingModel || isLoadingModelColors) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-900 text-2xl mb-4">Không tìm thấy mẫu xe</div>
          <Button onClick={() => navigate('/')} variant="outline">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const selectedColor = colorListWithImages[selectedColorIndex] || null;
  const selectedImageUrl = selectedColor?.imageUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 p-2">
              <div className="bg-white rounded-xl p-2 shadow-lg border-2 border-gray-200 cursor-default" style={{ pointerEvents: 'auto', opacity: 1 }}>
                <img 
                  src="/images/electra-logo1.png" 
                  alt="Electra Logo" 
                  className="h-14 w-24 object-contain cursor-default"
                  style={{ pointerEvents: 'auto', opacity: 1 }}
                  onError={(e) => {
                    // Fallback nếu logo chưa có, hiển thị icon cũ
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg hidden">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-white hover:text-green-400 transition-colors font-medium">
                Trang chủ
              </a>
              <a href="/#products" className="text-white hover:text-green-400 transition-colors font-medium">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Quay lại
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg aspect-[4/3]">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={`${model.modelName} - ${selectedColor?.colorName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Placeholder */}
              <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${selectedImageUrl ? 'hidden' : 'flex'}`}>
                <div className="text-gray-400 text-6xl font-bold opacity-30">
                  {model.modelName.split(' ')[1]?.charAt(0) || 'E'}
                </div>
              </div>
            </div>

            {/* Color Thumbnails */}
            {colorListWithImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {colorListWithImages.map((colorItem, index) => (
                  <button
                    key={colorItem.colorId}
                    onClick={() => setSelectedColorIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedColorIndex === index
                        ? 'border-green-600 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {colorItem.imageUrl ? (
                      <img
                        src={colorItem.imageUrl}
                        alt={colorItem.colorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Color Placeholder */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${colorItem.imageUrl ? 'hidden' : 'flex'}`}
                      style={{ backgroundColor: colorItem.hexCode }}
                    >
                      <div className="text-white text-xs font-semibold opacity-80">
                        {colorItem.colorName.charAt(0)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{model.modelName}</h1>
              <p className="text-lg text-gray-600">
                Mẫu xe {model.modelYear} • {model.bodyType}
              </p>
            </div>

            {/* Color Selection */}
            {colorListWithImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Màu sắc</h3>
                <div className="flex flex-wrap gap-3">
                  {colorListWithImages.map((colorItem, index) => (
                    <button
                      key={colorItem.colorId}
                      onClick={() => setSelectedColorIndex(index)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedColorIndex === index
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorItem.hexCode }}
                      />
                      <span className="text-sm font-medium text-gray-700">{colorItem.colorName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 gap-6">
                {model.batteryCapacity && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Battery className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pin</p>
                      <p className="text-lg font-semibold text-gray-900">{model.batteryCapacity} kWh</p>
                    </div>
                  </div>
                )}
                {model.range && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Gauge className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Quãng đường</p>
                      <p className="text-lg font-semibold text-gray-900">{model.range} km</p>
                    </div>
                  </div>
                )}
                {model.powerHp && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Zap className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Công suất</p>
                      <p className="text-lg font-semibold text-gray-900">{model.powerHp} HP</p>
                    </div>
                  </div>
                )}
                {model.torqueNm && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gauge className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mô-men xoắn</p>
                      <p className="text-lg font-semibold text-gray-900">{model.torqueNm} Nm</p>
                    </div>
                  </div>
                )}
                {model.acceleration && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tăng tốc (0-100km/h)</p>
                      <p className="text-lg font-semibold text-gray-900">{model.acceleration}s</p>
                    </div>
                  </div>
                )}
                {model.seatingCapacity && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Số chỗ ngồi</p>
                      <p className="text-lg font-semibold text-gray-900">{model.seatingCapacity} chỗ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {model.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h3>
                <p className="text-gray-600 leading-relaxed">{model.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;

