import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Car, AlertTriangle, Package, Layers, Palette, RefreshCw, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import MetricCard from '../../../components/shared/MetricCard';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { useGetStoreStocksQuery } from '../../../api/dealerStaff/storeStockApi';

const StoreStockPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModelId, setExpandedModelId] = useState(null);

    // Fetch data with error handling
    const { data: stocksData, isLoading, error } = useGetStoreStocksQuery();
    
    // Safely extract stocks array
    const stocks = useMemo(() => {
        if (!stocksData) return [];
        if (Array.isArray(stocksData)) return stocksData;
        if (stocksData.data && Array.isArray(stocksData.data)) return stocksData.data;
        return [];
    }, [stocksData]);

    // Group stocks by model
    const groupedStocks = useMemo(() => {
        const groups = {};
        stocks.forEach(stock => {
            const modelId = stock.modelId || 'unknown';
            const modelName = stock.modelName || 'Không xác định';
            
            if (!groups[modelId]) {
                groups[modelId] = {
                    modelId,
                    modelName,
                    totalQuantity: 0,
                    totalAvailableStock: 0,
                    variants: []
                };
            }
            groups[modelId].totalQuantity += (stock.quantity || 0);
            groups[modelId].totalAvailableStock += (stock.availableStock || 0);
            groups[modelId].variants.push({
                ...stock,
                // Ensure we have the color field for backward compatibility
                color: stock.colorName || stock.color || 'Không xác định'
            });
        });
        return Object.values(groups);
    }, [stocks]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalVehicles = stocks.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalAvailableVehicles = stocks.reduce((acc, curr) => acc + (curr.availableStock || 0), 0);
        const totalModels = groupedStocks.length;
        // Tính theo modelID thay vì từng variant
        const lowStockModels = groupedStocks.filter(group => {
            const available = group.totalAvailableStock || 0;
            return available > 0 && available < 5;
        }).length;
        const outOfStockModels = groupedStocks.filter(group => (group.totalAvailableStock || 0) === 0).length;
        const totalVariants = stocks.length;
        const averageStockPerModel = totalModels > 0 ? Math.round(totalVehicles / totalModels) : 0;
        const averageAvailablePerModel = totalModels > 0 ? Math.round(totalAvailableVehicles / totalModels) : 0;

        return {
            totalVehicles,
            totalAvailableVehicles,
            totalModels,
            lowStockItems: lowStockModels,
            outOfStockItems: outOfStockModels,
            totalVariants,
            averageStockPerModel,
            averageAvailablePerModel
        };
    }, [stocks, groupedStocks]);

    // Filter groups by search term
    const filteredGroups = useMemo(() => {
        return groupedStocks.filter(group =>
            group.modelName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groupedStocks, searchTerm]);

    const toggleExpand = (modelId) => {
        setExpandedModelId(expandedModelId === modelId ? null : modelId);
    };

    // Helper function to get color hex
    const getColorHex = (colorName) => {
        if (!colorName) return '#E5E7EB';
        
        const normalizedName = colorName.toLowerCase().trim();
        const colors = {
            'trắng': '#FFFFFF',
            'white': '#FFFFFF',
            'đen': '#000000',
            'black': '#000000',
            'đỏ': '#EF4444',
            'red': '#EF4444',
            'xanh': '#3B82F6',
            'xanh dương': '#3B82F6',
            'xanh duong': '#3B82F6',
            'blue': '#3B82F6',
            'xanh lá': '#22C55E',
            'xanh la': '#22C55E',
            'green': '#22C55E',
            'xám': '#6B7280',
            'xam': '#6B7280',
            'gray': '#6B7280',
            'grey': '#6B7280',
            'bạc': '#C0C0C0',
            'bac': '#C0C0C0',
            'silver': '#C0C0C0',
            'nâu': '#92400E',
            'nau': '#92400E',
            'brown': '#92400E',
            'vàng': '#EAB308',
            'vang': '#EAB308',
            'yellow': '#EAB308',
            'cam': '#F97316',
            'orange': '#F97316',
            'tím': '#A855F7',
            'tim': '#A855F7',
            'purple': '#A855F7',
            'hồng': '#EC4899',
            'hong': '#EC4899',
            'pink': '#EC4899',
        };
        
        return colors[normalizedName] || '#E5E7EB';
    };

    if (isLoading) {
        return (
            <DealerStaffLayout
                title="Kho xe tại cửa hàng"
                description="Quản lý số lượng xe tồn kho theo mẫu và màu sắc."
            >
                <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
                    {/* Loading Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                                <LoadingSkeleton className="h-4 w-24 mb-2" />
                                <LoadingSkeleton className="h-8 w-16 mb-2" />
                                <LoadingSkeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                    
                    {/* Loading Table */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <LoadingSkeleton className="h-6 w-48 mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <LoadingSkeleton className="h-12 w-12 rounded-lg" />
                                    <LoadingSkeleton className="h-4 flex-1" />
                                    <LoadingSkeleton className="h-4 w-16" />
                                    <LoadingSkeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DealerStaffLayout>
        );
    }

    if (error) {
        return (
            <DealerStaffLayout
                title="Kho xe tại cửa hàng"
                description="Quản lý số lượng xe tồn kho theo mẫu và màu sắc."
            >
                <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-12">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Có lỗi xảy ra khi tải dữ liệu kho
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {error.status === 404 
                                    ? 'Không tìm thấy dữ liệu kho hàng. Có thể chưa có dữ liệu hoặc bạn chưa có quyền truy cập.' 
                                    : 'Vui lòng kiểm tra kết nối mạng và thử lại sau.'
                                }
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </DealerStaffLayout>
        );
    }

    return (
        <DealerStaffLayout
            title="Kho xe tại cửa hàng"
            description="Quản lý số lượng xe tồn kho theo mẫu và màu sắc."
        >
            <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Tổng xe trong kho"
                        value={stats.totalVehicles.toLocaleString()}
                        icon={Car}
                        className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow"
                    />
                    <MetricCard
                        title="Xe có sẵn bán"
                        value={stats.totalAvailableVehicles.toLocaleString()}
                        icon={Package}
                        className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow"
                    />
                    <MetricCard
                        title="Sắp hết hàng"
                        value={`${stats.lowStockItems} dòng`}
                        icon={AlertTriangle}
                        className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow"
                    />
                    <MetricCard
                        title="Hết hàng"
                        value={`${stats.outOfStockItems} dòng`}
                        icon={Layers}
                        className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow"
                    />
                </div>

          
                {/* Main Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                    placeholder="Tìm kiếm theo tên xe..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-600">
                                    Hiển thị {filteredGroups.length} / {groupedStocks.length} dòng xe
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Dòng xe
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Kho / Có sẵn
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Chi tiết
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredGroups.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="p-3 rounded-full bg-slate-100">
                                                    <Package size={24} className="text-slate-400" />
                                                </div>
                                                <p>
                                                    {stocks.length === 0 
                                                        ? 'Chưa có dữ liệu kho hàng' 
                                                        : 'Không tìm thấy xe nào phù hợp'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroups.map((group, index) => {
                                        const isExpanded = expandedModelId === group.modelId;
                                        const availableStock = group.totalAvailableStock;
                                        const getMainStockStatus = (stock) => {
                                            if (stock === 0) return { isLowStock: true, label: 'Hết hàng', color: 'bg-red-100 text-red-800', borderColor: 'border-l-red-500' };
                                            if (stock < 5) return { isLowStock: true, label: 'Sắp hết hàng', color: 'bg-orange-100 text-orange-800', borderColor: 'border-l-orange-400' };
                                            if (stock > 20) return { isLowStock: false, label: 'Còn nhiều', color: 'bg-blue-100 text-blue-800', borderColor: 'border-l-blue-500' };
                                            return { isLowStock: false, label: 'Còn hàng', color: 'bg-green-100 text-green-800', borderColor: 'border-l-green-500' };
                                        };
                                        const mainStockStatus = getMainStockStatus(availableStock);

                                        return (
                                            <>
                                                <motion.tr 
                                                    key={group.modelId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className={`hover:bg-slate-50 transition-all duration-200 cursor-pointer border-l-4 ${
                                                        isExpanded 
                                                            ? 'bg-slate-50 border-l-blue-500' 
                                                            : mainStockStatus.borderColor
                                                    }`}
                                                    onClick={() => toggleExpand(group.modelId)}
                                                >
                                                    {/* Dòng xe */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                                <Car size={20} />
                                                            </div>
                                                            <span className="font-bold text-slate-900">{group.modelName}</span>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Kho / Có sẵn */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-6">
                                                            <div className="text-center">
                                                                <div className="text-lg font-bold text-slate-900">{group.totalQuantity}</div>
                                                                <div className="text-xs text-slate-500">Tổng kho</div>
                                                            </div>
                                                            <div className="text-slate-300">/</div>
                                                            <div className="text-center">
                                                                <div className="text-lg font-bold text-green-600">{group.totalAvailableStock}</div>
                                                                <div className="text-xs text-slate-500">Có sẵn</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Trạng thái */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mainStockStatus.color}`}>
                                                            {mainStockStatus.label}
                                                        </span>
                                                    </td>
                                                    
                                                    {/* Chi tiết */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </button>
                                                    </td>
                                                </motion.tr>

                                                {/* Expanded Variants */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.tr
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            <td colSpan="4" className="px-0 py-0 border-b border-slate-200 bg-slate-50/50">
                                                                <div className="p-6 pl-16">
                                                                    <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                                        <Palette size={16} className="text-slate-500" />
                                                                        Chi tiết theo màu sắc
                                                                    </h4>

                                                                    <table className="w-full">
                                                                        <tbody>
                                                                            {group.variants.map((variant, variantIndex) => {
                                                                                const availableStock = variant.availableStock || 0;
                                                                                const getStockStatus = (stock) => {
                                                                                    if (stock === 0) return { 
                                                                                        label: 'Hết hàng', 
                                                                                        color: 'bg-red-100 text-red-700', 
                                                                                        bgColor: 'bg-red-50/30'
                                                                                    };
                                                                                    if (stock < 5) return { 
                                                                                        label: 'Sắp hết', 
                                                                                        color: 'bg-orange-100 text-orange-700', 
                                                                                        bgColor: 'bg-orange-50/30'
                                                                                    };
                                                                                    if (stock > 20) return { 
                                                                                        label: 'Còn nhiều', 
                                                                                        color: 'bg-blue-100 text-blue-700', 
                                                                                        bgColor: 'bg-blue-50/30'
                                                                                    };
                                                                                    return { 
                                                                                        label: 'Còn hàng', 
                                                                                        color: 'bg-green-100 text-green-700', 
                                                                                        bgColor: 'bg-green-50/30'
                                                                                    };
                                                                                };
                                                                                const stockStatus = getStockStatus(availableStock);
                                                                                return (
                                                                                    <motion.tr
                                                                                        key={variant.storeStockId || variantIndex}
                                                                                        initial={{ opacity: 0, x: -20 }}
                                                                                        animate={{ opacity: 1, x: 0 }}
                                                                                        transition={{ duration: 0.2, delay: variantIndex * 0.05 }}
                                                                                        className={`border-b border-slate-100 hover:shadow-sm transition-all duration-200 ${stockStatus.bgColor}`}
                                                                                    >
                                                                                        {/* Color and Name - aligned with "Dòng xe" */}
                                                                                        <td className="px-6 py-3">
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div
                                                                                                    className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-slate-200 flex-shrink-0"
                                                                                                    style={{ backgroundColor: getColorHex(variant.colorName || variant.color || 'Xám') }}
                                                                                                    title={variant.colorName || variant.color || 'Không xác định'}
                                                                                                ></div>
                                                                                                <span className="font-medium text-slate-900">
                                                                                                    {variant.colorName || variant.color || 'Không xác định'}
                                                                                                </span>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Stock Numbers - aligned with "Kho / Có sẵn" */}
                                                                                        <td className="px-6 py-3 text-center">
                                                                                            <div className="flex items-center justify-center gap-4">
                                                                                                <div className="text-center">
                                                                                                    <div className="text-lg font-bold text-slate-900">
                                                                                                        {variant.quantity || 0}
                                                                                                    </div>
                                                                                                    <div className="text-xs text-slate-500">Tổng kho</div>
                                                                                                </div>
                                                                                                <div className="text-slate-300">/</div>
                                                                                                <div className="text-center">
                                                                                                    <div className="text-lg font-bold text-green-600">
                                                                                                        {availableStock}
                                                                                                    </div>
                                                                                                    <div className="text-xs text-slate-500">Có sẵn</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>

                                                                                        {/* Status - aligned with "Trạng thái" */}
                                                                                        <td className="px-6 py-3 text-center">
                                                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                                                                                                {stockStatus.label}
                                                                                            </span>
                                                                                        </td>

                                                                                        {/* Price - aligned with "Chi tiết" */}
                                                                                        <td className="px-6 py-3 text-right">
                                                                                            {variant.priceOfStore && (
                                                                                                <div>
                                                                                                    <div className="text-sm font-semibold text-blue-600">
                                                                                                        {variant.priceOfStore.toLocaleString('vi-VN')} VNĐ
                                                                                                    </div>
                                                                                                    <div className="text-xs text-slate-500">
                                                                                                        Giá tại cửa hàng
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                    </motion.tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DealerStaffLayout>
    );
};

export default StoreStockPage;
