import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { 
  Search, 
  AlertCircle,
  Warehouse,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { ModernCard, ModernCardHeader, ModernCardContent } from '../../components/ui/ModernCard';
import { ModernTable, ModernTableHead, ModernTableHeader, ModernTableBody, ModernTableRow, ModernTableCell } from '../../components/ui/ModernTable';
import ModernButton from '../../components/ui/ModernButton';
import { LoadingSpinner } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

function Inventory() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { toast, hideToast } = useToast();
  const { confirm, hideConfirm } = useConfirm();
  
  // Redux state
  const storeStocks = useSelector((state) => state.storeStocks.items);
  const storeStocksStatus = useSelector((state) => state.storeStocks.status);
  const storeStocksError = useSelector((state) => state.storeStocks.error);
  
  const [groupedInventory, setGroupedInventory] = useState([]);
  const [filteredGroupedInventory, setFilteredGroupedInventory] = useState([]);
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Use ref to prevent duplicate API calls
  const hasFetchedStoreStocksRef = useRef(false);

  // Fetch all store stocks from API
  useEffect(() => {
    // Only fetch once
    if (hasFetchedStoreStocksRef.current) {
      return;
    }
    
    hasFetchedStoreStocksRef.current = true;
    dispatch(getAllStoreStocksThunk());
  }, [dispatch]);

  // Transform API data to grouped format by model
  useEffect(() => {
    if (storeStocksStatus === 'succeeded') {
      if (storeStocks.length > 0) {
        // Group by model
        const grouped = storeStocks.reduce((acc, stock) => {
          const modelId = stock.modelId;
          const modelName = stock.modelName;
          
          if (!acc[modelId]) {
            acc[modelId] = {
              modelId,
              model: modelName,
              totalStock: 0,
              colors: []
            };
          }
          
          acc[modelId].totalStock += stock.quantity;
          acc[modelId].colors.push({
            color: stock.colorName,
            stock: stock.quantity,
            price: stock.priceOfStore,
            stockId: stock.stockId
          });
          
          return acc;
        }, {});
        
        // Convert to array and sort
        const groupedArray = Object.values(grouped)
          .map(model => ({
            ...model,
            colors: model.colors.sort((a, b) => a.color.localeCompare(b.color))
          }))
          .sort((a, b) => a.model.localeCompare(b.model));
        
        setGroupedInventory(groupedArray);
        setFilteredGroupedInventory(groupedArray);
      } else {
        setGroupedInventory([]);
        setFilteredGroupedInventory([]);
      }
    }
  }, [storeStocks, storeStocksStatus]);

  // Filter inventory based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroupedInventory(groupedInventory);
    } else {
      const filtered = groupedInventory.filter(model =>
        model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.colors.some(colorItem =>
          colorItem.color.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ).map(model => ({
        ...model,
        colors: model.colors.filter(colorItem =>
          model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          colorItem.color.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }));
      setFilteredGroupedInventory(filtered);
    }
  }, [searchTerm, groupedInventory]);

  const toggleModel = (modelId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const getColorPreview = (colorName) => {
    const colorMap = {
      'Trắng Ngọc Trai': 'bg-white border border-gray-300',
      'Đen Bóng': 'bg-black',
      'Xanh Dương Đậm': 'bg-blue-800',
      'Đỏ Ruby': 'bg-red-600',
      'Bạc Metallic': 'bg-gray-400',
      'Xám Titan': 'bg-gray-600'
    };
    return colorMap[colorName] || 'bg-gray-300';
  };


  // Loading state
  if (storeStocksStatus === 'loading') {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5">
        <Toast 
          show={toast.show} 
          type={toast.type} 
          message={toast.message} 
          onClose={hideToast}
        />
        
        <ConfirmDialog
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          type={confirm.type}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />

        <ModernCard>
          <ModernCardContent>
            <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" color="emerald" />
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 font-medium">
                  Đang tải dữ liệu kho hàng...
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  // Error state
  if (storeStocksStatus === 'failed') {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5">
        <Toast 
          show={toast.show} 
          type={toast.type} 
          message={toast.message} 
          onClose={hideToast}
        />
        
        <ConfirmDialog
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          type={confirm.type}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />

        <ModernCard>
          <ModernCardContent>
            <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Lỗi tải dữ liệu
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {storeStocksError || 'Không thể tải dữ liệu kho hàng'}
                </p>
                <ModernButton
                  onClick={() => dispatch(getAllStoreStocksThunk())}
                  variant="primary"
                >
                  Thử lại
                </ModernButton>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      {/* Main Inventory Card */}
      <ModernCard gradient roleColor="emerald">
        <ModernCardHeader
          title="Xem kho hàng"
          subtitle={user?.storeName ? `Cửa hàng: ${user.storeName}` : 'Tổng quan kho hàng'}
          icon={<Warehouse className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
        <ModernCardContent>
        {/* Search Bar */}
          <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
                placeholder="Tìm kiếm theo model, màu sắc..."
              value={searchTerm}
              onChange={handleSearchChange}
                className="w-full pl-9 sm:pl-10 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

          {/* Inventory Dropdowns */}
          {filteredGroupedInventory.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {filteredGroupedInventory.map((model) => {
                const isExpanded = expandedModels.has(model.modelId);
                
                return (
                  <div
                    key={model.modelId}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Model Header - Dropdown Trigger */}
                    <button
                      onClick={() => toggleModel(model.modelId)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm flex-shrink-0">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">{model.model}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Tổng tồn: <span className="font-semibold text-gray-900">{model.totalStock} xe</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {model.colors.length} màu
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Color Details - Dropdown Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/30">
                        <ModernTable>
                          <ModernTableHead>
                            <tr>
                              <ModernTableHeader>Màu sắc</ModernTableHeader>
                              <ModernTableHeader className="text-center">Số lượng tồn</ModernTableHeader>
                              <ModernTableHeader className="text-right">Giá bán (VNĐ)</ModernTableHeader>
                            </tr>
                          </ModernTableHead>
                          <ModernTableBody>
                            {model.colors.map((colorItem, colorIdx) => (
                              <ModernTableRow 
                                key={colorItem.stockId} 
                                index={colorIdx}
                              >
                                <ModernTableCell>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full ${getColorPreview(colorItem.color)} border-2 border-white shadow-sm`}></div>
                                    <span className="text-sm font-medium text-gray-900">{colorItem.color}</span>
                                  </div>
                                </ModernTableCell>
                                <ModernTableCell className="text-center">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {colorItem.stock} xe
                                  </span>
                                </ModernTableCell>
                                <ModernTableCell className="text-right">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {colorItem.price.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                </ModernTableCell>
                              </ModernTableRow>
                            ))}
                          </ModernTableBody>
                        </ModernTable>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon="package"
                title={searchTerm ? 'Không tìm thấy xe nào' : 'Không có dữ liệu kho hàng'}
                description={searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm.' 
                  : 'Kho hàng hiện tại chưa có xe nào.'
                }
                roleColor="emerald"
              />
        </div>
      )}
        </ModernCardContent>
      </ModernCard>

    </div>
  );
}

export default Inventory;
