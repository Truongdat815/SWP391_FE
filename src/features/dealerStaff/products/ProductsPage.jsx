import { useState, useMemo } from 'react';
import { Search, Eye, Car } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useGetAllColorsQuery } from '../../../api/evmStaff/colorApi';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);

  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: modelColorsData, isLoading: isLoadingColors } = useGetAllModelColorsQuery();
  const { data: colorsData } = useGetAllColorsQuery();

  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];
  const colors = Array.isArray(colorsData?.data) ? colorsData.data : [];

  const filteredModels = useMemo(() => {
    if (!Array.isArray(models)) return [];
    return models.filter((model) => {
      const matchesSearch =
        model.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.modelId?.toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [models, searchTerm]);

  const selectedModelColors = useMemo(() => {
    if (!selectedModel || !Array.isArray(modelColors)) return [];
    return modelColors.filter((mc) => mc.modelId === selectedModel.modelId);
  }, [selectedModel, modelColors]);

  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  if (isLoadingModels) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  if (modelsError) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Xem thông tin các mẫu xe và màu sắc có sẵn</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <SearchBar
            placeholder="Tìm kiếm mẫu xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => {
            const modelColorCount = modelColors.filter((mc) => mc.modelId === model.modelId).length;
            return (
              <Card
                key={model.modelId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedModel(selectedModel?.modelId === model.modelId ? null : model)}
              >
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{model.modelName}</h3>
                      <p className="text-sm text-gray-600 mt-1">Năm {model.modelYear}</p>
                    </div>
                    <Car size={32} className="text-blue-600" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dung lượng pin:</span>
                      <span className="font-medium">{model.batteryCapacity} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quãng đường:</span>
                      <span className="font-medium">{model.range} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Công suất:</span>
                      <span className="font-medium">{model.powerHp} HP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số màu:</span>
                      <span className="font-medium">{modelColorCount} màu</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        {/* Model Details Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModel.modelName}</h2>
                  <Button variant="outline" onClick={() => setSelectedModel(null)}>
                    Đóng
                  </Button>
                </div>

                {/* Model Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Năm sản xuất</p>
                    <p className="font-semibold">{selectedModel.modelYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại thân xe</p>
                    <p className="font-semibold">{selectedModel.bodyType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dung lượng pin</p>
                    <p className="font-semibold">{selectedModel.batteryCapacity} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quãng đường</p>
                    <p className="font-semibold">{selectedModel.range} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Công suất</p>
                    <p className="font-semibold">{selectedModel.powerHp} HP</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mô-men xoắn</p>
                    <p className="font-semibold">{selectedModel.torqueNm} Nm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gia tốc (0-100km/h)</p>
                    <p className="font-semibold">{selectedModel.acceleration} giây</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số chỗ ngồi</p>
                    <p className="font-semibold">{selectedModel.seatingCapacity} chỗ</p>
                  </div>
                </div>

                {selectedModel.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                    <p className="text-gray-900">{selectedModel.description}</p>
                  </div>
                )}

                {/* Color Variants */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Màu sắc có sẵn</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedModelColors.map((mc) => {
                      const color = colors.find((c) => c.colorId === mc.colorId);
                      return (
                        <Card key={mc.id} className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-8 h-8 rounded-full border border-gray-300"
                              style={{ backgroundColor: color?.colorCode || '#ccc' }}
                            />
                            <div>
                              <p className="font-medium">{color?.colorName || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{formatCurrency(mc.price)}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy mẫu xe nào</p>
          </div>
        )}
      </div>
    </DealerStaffLayout>
  );
};

export default ProductsPage;

