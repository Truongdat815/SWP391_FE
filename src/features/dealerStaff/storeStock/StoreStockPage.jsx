import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Car, AlertTriangle, Package, Layers, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import MetricCard from '../../../components/shared/MetricCard';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { useGetStoreStocksQuery } from '../../../api/dealerStaff/storeStockApi';

const StoreStockPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModelId, setExpandedModelId] = useState(null);

    const { data: stocksData, isLoading, error } = useGetStoreStocksQuery();
    const stocks = Array.isArray(stocksData?.data) ? stocksData.data : [];

    // Group stocks by model
    const groupedStocks = useMemo(() => {
        const groups = {};
        stocks.forEach(stock => {
            if (!groups[stock.modelId]) {
                groups[stock.modelId] = {
                    modelId: stock.modelId,
                    modelName: stock.modelName,
                    totalQuantity: 0,
                    variants: []
                };
            }
            groups[stock.modelId].totalQuantity += stock.quantity;
            groups[stock.modelId].variants.push(stock);
        });
        return Object.values(groups);
    }, [stocks]);

    // Stats Calculation
    const stats = useMemo(() => {
        const totalVehicles = stocks.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalModels = groupedStocks.length;
        const lowStockItems = stocks.filter(s => s.quantity < 5).length;
        // Mock value for total value as price might not be in stock API
        // If price is available, we can calculate it. Assuming not for now.

        return {
            totalVehicles,
            totalModels,
            lowStockItems
        };
    }, [stocks, groupedStocks]);

    const filteredGroups = useMemo(() => {
        return groupedStocks.filter(group =>
            group.modelName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groupedStocks, searchTerm]);

    const toggleExpand = (modelId) => {
        setExpandedModelId(expandedModelId === modelId ? null : modelId);
    };

    if (isLoading) {
        return (
            <DealerStaffLayout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSkeleton className="w-20 h-20" variant="circle" />
                </div>
            </DealerStaffLayout>
        );
    }

    if (error) {
        return (
            <DealerStaffLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu kho.</div>
                </div>
            </DealerStaffLayout>
        );
    }

    return (
        <DealerStaffLayout
            title="Kho xe tại cửa hàng"
            description="Quản lý số lượng xe tồn kho theo mẫu và màu sắc."
        >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">


                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Tổng số xe"
                        value={stats.totalVehicles}
                        icon={Car}
                        className="border-l-4 border-l-blue-500"
                    />
                    <MetricCard
                        title="Số dòng xe"
                        value={stats.totalModels}
                        icon={Layers}
                        className="border-l-4 border-l-purple-500"
                    />
                    <MetricCard
                        title="Sắp hết hàng (<5)"
                        value={stats.lowStockItems}
                        icon={AlertTriangle}
                        className="border-l-4 border-l-orange-500"
                    />
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                                placeholder="Tìm kiếm theo tên xe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dòng xe</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số lượng</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết</th>
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
                                                <p>Không tìm thấy xe nào trong kho</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroups.map((group) => {
                                        const isExpanded = expandedModelId === group.modelId;
                                        const isLowStock = group.totalQuantity < 5;

                                        return (
                                            <>
                                                <tr
                                                    key={group.modelId}
                                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                                                    onClick={() => toggleExpand(group.modelId)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                                <Car size={20} />
                                                            </div>
                                                            <span className="font-bold text-slate-900">{group.modelName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="text-lg font-bold text-slate-900">{group.totalQuantity}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {isLowStock ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Sắp hết hàng
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Còn hàng
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </button>
                                                    </td>
                                                </tr>

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

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {group.variants.map((variant) => (
                                                                            <div
                                                                                key={variant.storeStockId}
                                                                                className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div
                                                                                        className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                                                                                        style={{ backgroundColor: getColorHex(variant.color) }}
                                                                                        title={variant.color}
                                                                                    ></div>
                                                                                    <span className="font-medium text-slate-700">{variant.color}</span>
                                                                                </div>
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="text-lg font-bold text-slate-900">{variant.quantity}</span>
                                                                                    <span className="text-xs text-slate-500">xe</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
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

// Helper function to map color names to hex codes (simplified)
const getColorHex = (colorName) => {
    const colors = {
        'Trắng': '#FFFFFF',
        'Đen': '#000000',
        'Đỏ': '#EF4444',
        'Xanh': '#3B82F6',
        'Xám': '#6B7280',
        'Bạc': '#C0C0C0',
        'Nâu': '#92400E',
        'Vàng': '#EAB308',
        // Add more mappings as needed
    };
    return colors[colorName] || '#E5E7EB'; // Default to gray-200
};

export default StoreStockPage;
