import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    ShoppingCart, 
    Plus, 
    Trash2, 
    ArrowLeft, 
    CheckCircle, 
    AlertCircle,
    Loader2,
    Package,
    Tag,
    DollarSign,
    FileText
} from 'lucide-react';
import { getAllStoreStocks } from '../../api/store-stockService';
import { createOrderDetailsInBatch } from '../../api/order-detailService';
import { fetchActivePromotions } from '../../store/slices/promotionSlice';
import { calculateDiscount } from '../../api/promotionService';

function AddOrderDetails() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get order info from navigation state
    const [orderInfo, setOrderInfo] = useState(location.state?.orderData || null);
    const [customerInfo] = useState(location.state?.customerInfo || null);
    
    // State for stock management
    const [availableStock, setAvailableStock] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]); // Array of details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Get promotions from Redux
    const { activePromotions } = useSelector((state) => state.promotions);
    
    // State for adding product form
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [licensePlateFee, setLicensePlateFee] = useState(2000000); // Default 2M VND
    const [registrationFee, setRegistrationFee] = useState(20000000); // Default 20M VND
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    
    // Load available stock and promotions on mount
    useEffect(() => {
        loadData();
    }, [dispatch]);
    
    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load store stocks
            const stockResponse = await getAllStoreStocks();
            const stocks = stockResponse.data || stockResponse;
            setAvailableStock(Array.isArray(stocks) ? stocks : []);
            
            // Load active promotions
            await dispatch(fetchActivePromotions());
            
            // ✅ Check if creating new order or editing existing order
            const isCreatingNewOrder = location.state?.orderData; // Has orderData = creating new
            const isEditingOrder = location.state?.fromEdit; // Has fromEdit flag = editing existing
            
            // 1 order = multiple details - start with empty array
            console.log('✨ Starting with empty order details');
            setOrderDetails([]);
            
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Không thể tải dữ liệu kho xe. Vui lòng thử lại.');
            setLoading(false);
        }
    };
    
    // Calculate prices
    const calculatePrice = () => {
        if (!selectedStock) return {
            unitPrice: 0,
            subtotal: 0,
            vat: 0,
            fees: 0,
            discount: 0,
            total: 0
        };
        
        const unitPrice = selectedStock.priceOfStore || 0;
        const subtotal = unitPrice * quantity;
        const vat = subtotal * 0.1; // 10% VAT
        const fees = licensePlateFee + registrationFee;
        const discount = selectedPromotion ? calculateDiscount(subtotal, selectedPromotion) : 0;
        const total = subtotal + vat + fees - discount;
        
        return {
            unitPrice,
            subtotal,
            vat,
            fees,
            discount,
            total
        };
    };
    
    // Reset form
    const resetForm = () => {
        setSelectedStock(null);
        setQuantity(1);
        setLicensePlateFee(2000000);
        setRegistrationFee(20000000);
        setSelectedPromotion(null);
    };
    
    // Add product detail (can add multiple)
    const handleAddDetail = async () => {
        if (!selectedStock) {
            setError('Vui lòng chọn xe');
            return;
        }
        
        if (quantity > selectedStock.quantity) {
            setError(`Số lượng tồn kho không đủ. Chỉ còn ${selectedStock.quantity} xe.`);
            return;
        }
        
        console.log('Selected Stock:', selectedStock);
        
        const prices = calculatePrice();
        
        // Get stock ID - handle different possible field names from backend
        const stockId = selectedStock.stockId || selectedStock.storeStockId || selectedStock.id;
        
        if (!stockId) {
            setError('Không thể xác định ID của xe. Vui lòng thử lại.');
            console.error('Stock ID not found in:', selectedStock);
            return;
        }
        
        const detailData = {
            orderId: parseInt(orderId),
            storeStockId: stockId,
            unitPrice: prices.unitPrice,
            quantity: quantity,
            vatAmount: prices.vat,
            licensePlateFee: licensePlateFee,
            registrationFee: registrationFee,
            discountAmount: prices.discount,
            totalPrice: prices.total,
            // Only add these optional fields if they have values
            ...(selectedPromotion?.promotionId && { promotionId: selectedPromotion.promotionId }),
            ...(selectedStock.modelId && { modelId: selectedStock.modelId }),
            ...(selectedStock.modelColorId && { modelColorId: selectedStock.modelColorId }),
            ...(selectedStock.colorId && { colorId: selectedStock.colorId })
        };
        
        console.log('Detail Data to add locally:', detailData);
        console.log('Selected Stock ALL fields:', selectedStock);
        
        // ⭐ Save to local state only - will send all to API when "Lưu đơn hàng"
        const newDetail = {
            // Temporary ID for frontend rendering
            orderDetailId: Date.now(),
            // Data to send to API later
            ...detailData,
            // Display info
            modelName: selectedStock.modelName,
            colorName: selectedStock.colorName
        };
        
        // Add to local array
        setOrderDetails([...orderDetails, newDetail]);
        setSuccess('✅ Đã thêm sản phẩm! Nhấn "Lưu đơn hàng" để hoàn tất.');
        
        // Reset form
        resetForm();
        
        setTimeout(() => setSuccess(null), 3000);
    };
    
    // Remove a detail from local list
    const handleRemoveDetail = (detailId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            return;
        }
        
        console.log('🗑️ Removing product from local list:', detailId);
        
        // Remove from local state only
        const updatedDetails = orderDetails.filter(d => d.orderDetailId !== detailId);
        setOrderDetails(updatedDetails);
        
        setSuccess('Đã xóa sản phẩm!');
        setTimeout(() => setSuccess(null), 3000);
    };
    
    // Complete order - send all details to API at once
    const handleCompleteOrder = async () => {
        if (orderDetails.length === 0) {
            setError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('=== SAVING ORDER WITH ALL DETAILS ===');
            console.log('Order ID:', orderId);
            console.log('Number of details:', orderDetails.length);
            console.log('Details to send:', orderDetails);
            
            // Send all order details in one API call
            const result = await createOrderDetailsInBatch(parseInt(orderId), orderDetails);
            console.log('✅ All order details saved successfully:', result);
            
            setLoading(false);
            
            // Navigate to view orders page
            navigate('/dealer-staff/view-orders', {
                state: {
                    message: `Đơn hàng đã được tạo thành công với ${orderDetails.length} sản phẩm!`,
                    newOrderId: orderId,
                    success: true
                }
            });
        } catch (error) {
            console.error('❌ Error saving order details:', error);
            setError(error.message || 'Không thể lưu đơn hàng. Vui lòng thử lại.');
            setLoading(false);
        }
    };
    
    // Calculate grand total (sum of all details)
    const grandTotal = orderDetails.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0);
    
    if (!orderInfo && !customerInfo) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
                    <button
                        onClick={() => navigate('/dealer-staff/create-order')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Quay lại tạo đơn hàng
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Toast Notifications */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-green-700">{success}</span>
                </div>
            )}
            
            {/* Header - Order Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <ShoppingCart className="h-8 w-8 text-emerald-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Thêm Sản Phẩm Vào Đơn Hàng</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dealer-staff/create-order')}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Quay lại
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">Mã đơn hàng</span>
                        <span className="font-semibold text-gray-900">{orderInfo?.orderCode || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">Khách hàng</span>
                        <span className="font-semibold text-gray-900">{orderInfo?.customerName || customerInfo?.fullName}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">Số điện thoại</span>
                        <span className="font-semibold text-gray-900">{orderInfo?.customerPhone || customerInfo?.phone}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">Ngày tạo</span>
                        <span className="font-semibold text-gray-900">
                            {orderInfo?.orderDate ? new Date(orderInfo.orderDate).toLocaleDateString('vi-VN') : 'Hôm nay'}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Add Product Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center mb-6">
                    <Package className="h-6 w-6 text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Thêm Xe Vào Đơn Hàng</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Select Vehicle */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xe có sẵn trong kho
                        </label>
                        <select 
                            value={selectedStock ? (selectedStock.stockId || selectedStock.storeStockId || selectedStock.id) : ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const stock = availableStock.find(s => 
                                    (s.stockId || s.storeStockId || s.id) === value
                                );
                                setSelectedStock(stock);
                                setQuantity(1);
                            }}
                        >
                            <option value="">-- Chọn xe --</option>
                            {availableStock.map(stock => {
                                const stockId = stock.stockId || stock.storeStockId || stock.id;
                                return (
                                    <option key={stockId} value={stockId}>
                                        {stock.modelName} - {stock.colorName} 
                                        {' '}(Tồn: {stock.quantity}) - {(stock.priceOfStore || 0).toLocaleString()}đ
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số lượng
                        </label>
                        <input 
                            type="number" 
                            min="1"
                            max={selectedStock?.quantity || 1}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* License Plate Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí biển số (đ)
                        </label>
                        <input 
                            type="number"
                            value={licensePlateFee}
                            onChange={(e) => setLicensePlateFee(parseFloat(e.target.value) || 0)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Registration Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí đăng ký (đ)
                        </label>
                        <input 
                            type="number"
                            value={registrationFee}
                            onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Promotion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="inline h-4 w-4 mr-1" />
                            Khuyến mãi
                        </label>
                        <select 
                            value={selectedPromotion?.promotionId || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            onChange={(e) => {
                                const promo = activePromotions.find(p => p.promotionId === parseInt(e.target.value));
                                setSelectedPromotion(promo || null);
                            }}
                        >
                            <option value="">Không có khuyến mãi</option>
                            {activePromotions.map(promo => (
                                <option key={promo.promotionId} value={promo.promotionId}>
                                    {promo.promotionName} - {promo.promotionType === 'PERCENTAGE' 
                                        ? `${promo.amount}%` 
                                        : `${promo.amount.toLocaleString()}đ`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Price Calculation Display */}
                {selectedStock && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center mb-3">
                            <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                            <h4 className="font-semibold text-gray-900">Chi tiết giá</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600 block">Đơn giá</span>
                                <span className="font-semibold text-gray-900">
                                    {calculatePrice().unitPrice.toLocaleString()}đ
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Tạm tính</span>
                                <span className="font-semibold text-gray-900">
                                    {calculatePrice().subtotal.toLocaleString()}đ
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">VAT (10%)</span>
                                <span className="font-semibold text-gray-900">
                                    {calculatePrice().vat.toLocaleString()}đ
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Phí</span>
                                <span className="font-semibold text-gray-900">
                                    {calculatePrice().fees.toLocaleString()}đ
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Giảm giá</span>
                                <span className="font-semibold text-red-600">
                                    -{calculatePrice().discount.toLocaleString()}đ
                                </span>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <span className="text-gray-600 block">Thành tiền</span>
                                <span className="font-bold text-emerald-600 text-lg">
                                    {calculatePrice().total.toLocaleString()}đ
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAddDetail}
                        disabled={!selectedStock || loading}
                        className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Plus className="h-5 w-5 mr-2" />
                        )}
                        Thêm vào đơn hàng
                    </button>
                </div>
            </div>
            
            {/* Order Details List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <FileText className="h-6 w-6 text-emerald-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">
                            Danh Sách Sản Phẩm ({orderDetails.length})
                        </h3>
                    </div>
                </div>
                
                {orderDetails.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">Chưa có sản phẩm nào</p>
                        <p className="text-gray-400 text-sm">Vui lòng thêm sản phẩm vào đơn hàng</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Sản phẩm</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">SL</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Đơn giá</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Phí</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">VAT</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Giảm giá</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Thành tiền</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.map((detail, index) => (
                                        <tr key={detail.orderDetailId || index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Package className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {detail.modelName || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {detail.colorName || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-4 px-4 font-medium">{detail.quantity}</td>
                                            <td className="text-right py-4 px-4">
                                                {(detail.unitPrice || 0).toLocaleString()}đ
                                            </td>
                                            <td className="text-right py-4 px-4 text-sm text-gray-600">
                                                {((detail.licensePlateFee || 0) + (detail.registrationFee || 0)).toLocaleString()}đ
                                            </td>
                                            <td className="text-right py-4 px-4 text-sm text-gray-600">
                                                {(detail.vatAmount || 0).toLocaleString()}đ
                                            </td>
                                            <td className="text-right py-4 px-4 text-sm text-red-600">
                                                -{(detail.discountAmount || 0).toLocaleString()}đ
                                            </td>
                                            <td className="text-right py-4 px-4 font-bold text-emerald-600">
                                                {(detail.totalPrice || 0).toLocaleString()}đ
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                <button 
                                                    onClick={() => handleRemoveDetail(detail.orderDetailId)}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                                        <td colSpan="6" className="text-right py-4 px-4 font-bold text-gray-900 text-lg">
                                            TỔNG CỘNG:
                                        </td>
                                        <td className="text-right py-4 px-4 font-bold text-emerald-600 text-xl">
                                            {grandTotal.toLocaleString()}đ
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => navigate('/dealer-staff/create-order')}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleCompleteOrder}
                                disabled={loading}
                                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Lưu Đơn Hàng
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AddOrderDetails;

