import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    CheckCircle, 
    AlertCircle,
    Loader2,
    FileText,
    Package,
    User,
    Phone,
    Calendar,
    DollarSign,
    ArrowLeft
} from 'lucide-react';
import { createNewContract } from '../../store/slices/contractSlice';
import { getOrderById, updateOrderStatus } from '../../api/orderService';
import { getOrderDetailsByOrderId } from '../../api/order-detailService';

function OrderSummary() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [orderData, setOrderData] = useState(location.state?.orderData || null);
    const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || []);
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Contract form state
    const [showContractForm, setShowContractForm] = useState(true); // Show immediately
    const [depositPrice, setDepositPrice] = useState(0);
    const [terms, setTerms] = useState('');
    const [contractCreated, setContractCreated] = useState(false);
    
    // Get user info
    const { user } = useSelector((state) => state.auth);
    
    // Load order data and details from API if not in location state
    useEffect(() => {
        const loadOrderData = async () => {
            if (!orderId) {
                setError('Không tìm thấy mã đơn hàng');
                setInitialLoading(false);
                return;
            }
            
            try {
                setInitialLoading(true);
                
                // Load order data if not in state
                if (!orderData) {
                    const orderResponse = await getOrderById(orderId);
                    const order = orderResponse.data || orderResponse;
                    setOrderData(order);
                    
                    // Validate order status
                    if (order.status?.toUpperCase() !== 'APPROVED') {
                        setError(`Đơn hàng phải được phê duyệt trước khi tạo hợp đồng. Trạng thái hiện tại: ${order.status || 'N/A'}`);
                        setTimeout(() => {
                            navigate('/dealer-staff/view-orders');
                        }, 3000);
                        return;
                    }
                }
                
                // Load order details from getOrderDetailsResponses
                if (!orderDetails || orderDetails.length === 0) {
                    const details = latestOrder.getOrderDetailsResponses || [];
                    setOrderDetails(Array.isArray(details) ? details : []);
                    console.log('Loaded order details from response:', details);
                }
                
                setInitialLoading(false);
            } catch (error) {
                console.error('Error loading order data:', error);
                setError(error.message || 'Không thể tải dữ liệu đơn hàng');
                setInitialLoading(false);
            }
        };
        
        loadOrderData();
    }, [orderId]);
    
    // Calculate totals (sum of all details)
    const subtotal = orderDetails.reduce((sum, detail) => 
        sum + ((detail.unitPrice || 0) * (detail.quantity || 0)), 0);
    const totalVat = orderDetails.reduce((sum, detail) => 
        sum + (detail.vatAmount || 0), 0);
    const totalFees = orderDetails.reduce((sum, detail) => 
        sum + (detail.licensePlateFee || 0) + (detail.registrationFee || 0), 0);
    const totalDiscount = orderDetails.reduce((sum, detail) => 
        sum + (detail.discountAmount || 0), 0);
    const grandTotal = orderDetails.reduce((sum, detail) => 
        sum + (detail.totalPrice || 0), 0);
    
    // Default deposit is 30% of total
    useEffect(() => {
        setDepositPrice(Math.round(grandTotal * 0.3));
    }, [grandTotal]);
    
    // Handle create contract
    const handleCreateContract = async () => {
        if (depositPrice <= 0 || depositPrice > grandTotal) {
            setError('Số tiền đặt cọc không hợp lệ');
            return;
        }
        
        // Validate order status again before creating contract
        if (orderData?.status?.toUpperCase() !== 'APPROVED') {
            setError('Đơn hàng phải được phê duyệt trước khi tạo hợp đồng');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const contractData = {
                orderId: parseInt(orderId),
                contractDate: new Date().toISOString().split('T')[0],
                depositPrice: depositPrice,
                totalPayment: grandTotal,
                remainPrice: grandTotal - depositPrice,
                terms: terms || 'Điều khoản hợp đồng chuẩn',
                status: 'DRAFT',
                uploadedBy: user?.username || 'system'
            };
            
            // Create contract
            await dispatch(createNewContract(contractData)).unwrap();
            
            // Update order status to PROCESSING after creating contract
            await updateOrderStatus(orderId, 'PROCESSING');
            
            setSuccess('Hợp đồng đã được tạo thành công! Đơn hàng đã chuyển sang trạng thái "Đang xử lý".');
            setContractCreated(true);
            setLoading(false);
            
            // Navigate to orders list after 2 seconds
            setTimeout(() => {
                navigate('/dealer-staff/view-orders');
            }, 2000);
            
        } catch (error) {
            console.error('Error creating contract:', error);
            setError(error.message || 'Không thể tạo hợp đồng');
            setLoading(false);
        }
    };
    
    // Loading state
    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }
    
    // No data state
    if (!orderData && orderDetails.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
                    <button
                        onClick={() => navigate('/dealer-staff/view-orders')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Toast Notifications */}
            {error && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}
            
            {success && (
                <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-green-700">{success}</span>
                </div>
            )}
            
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-emerald-600 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hoàn Tất Đơn Hàng & Tạo Hợp Đồng</h2>
                            <p className="text-sm text-gray-500 mt-1">Kiểm tra thông tin và tạo hợp đồng cho đơn hàng</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/dealer-staff/add-order-details/${orderId}`)}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Quay lại chỉnh sửa
                    </button>
                </div>
                
                {/* Order Status Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mã đơn: {orderData?.orderCode || 'N/A'}
                </div>
            </div>
            
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Thông Tin Khách Hàng</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <div className="text-xs text-gray-500">Họ tên</div>
                            <div className="font-medium text-gray-900">{orderData?.customerName || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <div className="text-xs text-gray-500">Số điện thoại</div>
                            <div className="font-medium text-gray-900">{orderData?.customerPhone || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex items-center mb-4">
                    <Package className="h-6 w-6 text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Chi Tiết Đơn Hàng</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Sản phẩm</th>
                                <th className="text-center py-3 px-2 font-semibold text-gray-700">SL</th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">Đơn giá</th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">Phí</th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">VAT</th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">Giảm</th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.length > 0 ? (
                                orderDetails.map((detail, index) => (
                                    <tr key={detail.orderDetailId || index} className="border-b border-gray-100">
                                        <td className="py-3 px-2">
                                            <div className="font-medium text-gray-900">{detail.modelName || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{detail.colorName || ''}</div>
                                        </td>
                                        <td className="text-center py-3 px-2">{detail.quantity}</td>
                                        <td className="text-right py-3 px-2 text-sm">
                                            {(detail.unitPrice || 0).toLocaleString()}đ
                                        </td>
                                        <td className="text-right py-3 px-2 text-sm text-gray-600">
                                            {((detail.licensePlateFee || 0) + (detail.registrationFee || 0)).toLocaleString()}đ
                                        </td>
                                        <td className="text-right py-3 px-2 text-sm text-gray-600">
                                            {(detail.vatAmount || 0).toLocaleString()}đ
                                        </td>
                                        <td className="text-right py-3 px-2 text-sm text-red-600">
                                            -{(detail.discountAmount || 0).toLocaleString()}đ
                                        </td>
                                        <td className="text-right py-3 px-2 font-semibold text-emerald-600">
                                            {(detail.totalPrice || 0).toLocaleString()}đ
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-4 text-center text-gray-500">
                                        Chưa có sản phẩm trong đơn hàng
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Contract Form - Always shown */}
            {showContractForm && !contractCreated && (
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl shadow-sm border-2 border-emerald-200 p-4 mb-4">
                    <div className="flex items-center mb-4">
                        <FileText className="h-6 w-6 text-emerald-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">Tạo Hợp Đồng</h3>
                    </div>
                    
                    {/* Payment Summary in Contract Form */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Tổng Kết Thanh Toán</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính:</span>
                                <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">VAT (10%):</span>
                                <span className="font-medium">{totalVat.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí:</span>
                                <span className="font-medium">{totalFees.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Giảm giá:</span>
                                <span className="font-medium text-red-600">-{totalDiscount.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                                <span className="text-lg font-bold text-gray-900">TỔNG THANH TOÁN:</span>
                                <span className="text-xl font-bold text-emerald-600">{grandTotal.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền đặt cọc (đ) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="number"
                                value={depositPrice}
                                onChange={(e) => setDepositPrice(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Nhập số tiền đặt cọc"
                            />
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-500">
                                    Đề xuất: <span className="font-semibold">{Math.round(grandTotal * 0.3).toLocaleString()}đ</span> (30%)
                                </p>
                                <p className="text-sm font-semibold text-emerald-600">
                                    Còn lại phải trả: <span className="text-lg">{(grandTotal - depositPrice).toLocaleString()}đ</span>
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Điều khoản hợp đồng
                            </label>
                            <textarea 
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Nhập các điều khoản hợp đồng..."
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => navigate(`/dealer-staff/add-order-details/${orderId}`)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="inline h-5 w-5 mr-2" />
                                Quay lại chỉnh sửa
                            </button>
                            <button
                                onClick={handleCreateContract}
                                disabled={loading}
                                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5 mr-2" />
                                        Tạo Hợp Đồng & Hoàn Tất
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Success State After Contract Created */}
            {contractCreated && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Hoàn Tất!</h3>
                    <p className="text-green-700 mb-4">
                        Đơn hàng và hợp đồng đã được tạo thành công
                    </p>
                    <button
                        onClick={() => navigate('/dealer-staff/view-orders')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Xem danh sách đơn hàng
                    </button>
                </div>
            )}
        </div>
    );
}

export default OrderSummary;


