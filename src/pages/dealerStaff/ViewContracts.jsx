import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  uploadSignedContractThunk,
  fetchAllContractsThunk
} from '../../store/slices/contractSlice';
import { getContractHtml } from '../../api/contractService';
import { getOrderById } from '../../api/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Eye, 
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Package,
  Calendar,
  Download,
  X,
  User,
  Phone,
  DollarSign,
  ShoppingBag,
  UserCircle,
  Receipt,
  Tag
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function ViewContracts() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { contracts, loading } = useSelector((state) => state.contracts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadingContract, setUploadingContract] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch contracts on component mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter contracts by search
  const filteredContracts = (contracts || []).filter(contract => 
    contract.contractId?.toString().includes(searchTerm) ||
    contract.contractCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view contract HTML
  const handleViewContract = async (contract) => {
    try {
      // Fetch HTML with authentication
      const htmlContent = await getContractHtml(contract.contractId);
      
      // Create blob URL from HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open blob URL in new tab
      window.open(blobUrl, '_blank');
      
      // Clean up blob URL after 1 minute
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      console.error('Error viewing contract:', error);
      setErrorMessage('Không thể mở hợp đồng: ' + error.message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Handle upload signed contract
  const handleUploadClick = (contract) => {
    setSelectedContract(contract);
    setShowUploadModal(true);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedContract(null);
    setSelectedFile(null);
  };

  const handleViewOrder = async (contract) => {
    setSelectedOrder(null);
    setShowOrderModal(true);
    setLoadingOrderDetails(true);
    
    try {
      const orderResponse = await getOrderById(contract.orderId);
      const order = orderResponse.data || orderResponse;
      setSelectedOrder(order);
      
      // Backend returns product details in 'getOrderDetailsResponses' array
      const details = order.getOrderDetailsResponses || [];
      setOrderDetails(details);
    } catch (error) {
      console.error('Error loading order:', error);
      setErrorMessage('Không thể tải thông tin đơn hàng: ' + error.message);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Kích thước file không được vượt quá 10MB');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedContract) {
      setErrorMessage('Vui lòng chọn file để upload');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      setUploadingContract(selectedContract.contractId);
      
      const result = await dispatch(uploadSignedContractThunk({
        contractId: selectedContract.contractId,
        file: selectedFile
      })).unwrap();
      
      console.log('Upload result:', result);
      
      handleCloseModal();
      setSuccessMessage('Upload hợp đồng đã ký thành công!');
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading contract:', error);
      setErrorMessage('Không thể upload hợp đồng: ' + (error.message || error));
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setUploadingContract(null);
    }
  };

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ xử lý';
      case 'ACTIVE': return 'Đang hoạt động';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 text-emerald-600 mr-3" />
              Quản Lý Hợp Đồng
            </h1>
            <p className="text-gray-600 mt-1">
              Danh sách hợp đồng đã tạo - Xem và upload hợp đồng đã ký
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hợp đồng, mã đơn hàng, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải hợp đồng...</span>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-4">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có hợp đồng nào</p>
            <p className="text-gray-400 text-sm mt-2">Các hợp đồng đã tạo sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hợp đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã upload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hợp đồng đã ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.contractId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.contractCode || `#${contract.contractId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewOrder(contract)}
                        className="text-blue-600 hover:text-blue-900 hover:underline transition-colors font-medium"
                      >
                        {contract.orderCode || `ORD-${contract.orderId}`}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.customerName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.contractDate ? new Date(contract.contractDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(contract.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.signedContractFileUrl || contract.contractFileUrl ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Đã upload
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Chưa upload
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(contract.signedContractFileUrl || contract.contractFileUrl) ? (
                        <a 
                          href={contract.signedContractFileUrl || contract.contractFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 transition-colors underline font-medium"
                        >
                          Xem hợp đồng đã ký
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Tooltip content="Xem hợp đồng" placement="top">
                          <button
                            onClick={() => handleViewContract(contract)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        
                        <Tooltip content="Upload hợp đồng đã ký" placement="top">
                          <button
                            onClick={() => handleUploadClick(contract)}
                            disabled={uploadingContract === contract.contractId}
                            className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingContract === contract.contractId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md p-4 border shadow-2xl rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Hợp Đồng Đã Ký
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Mã hợp đồng: <span className="font-semibold">{selectedContract.contractCode || `#${selectedContract.contractId}`}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Upload Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file hợp đồng đã ký
                </label>
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Chấp nhận: JPG, PNG, PDF (tối đa 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadingContract === selectedContract.contractId}
                  className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingContract === selectedContract.contractId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseOrderModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-7xl p-4 border shadow-2xl rounded-2xl bg-white max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Receipt className="h-8 w-8 text-emerald-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Chi tiết đơn hàng
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Mã: <span className="font-semibold ml-1">{selectedOrder.orderCode || `ORD-${selectedOrder.orderId}`}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseOrderModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-blue-900">Thông tin khách hàng</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <UserCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Tên khách hàng</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedOrder.customerName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Số điện thoại</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedOrder.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900">Tổng quan tài chính</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-emerald-700">Tổng giá sản phẩm:</span>
                      <span className="text-sm font-semibold text-emerald-900">
                        {(selectedOrder.totalPrice || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-emerald-700">Thuế VAT:</span>
                      <span className="text-sm font-semibold text-orange-600">
                        +{(selectedOrder.totalTaxPrice || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="pt-2 border-t-2 border-emerald-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-900">Tổng thanh toán:</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {(selectedOrder.totalPayment || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                    <h4 className="font-bold text-white flex items-center text-lg">
                      <ShoppingBag className="h-6 w-6 mr-2" />
                      Chi tiết sản phẩm
                    </h4>
                  </div>
                  
                  {loadingOrderDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                      <span className="text-gray-600 font-medium">Đang tải chi tiết sản phẩm...</span>
                    </div>
                  ) : orderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Đơn giá
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {orderDetails.map((item, index) => (
                            <tr key={index} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{item.modelName || 'N/A'}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.colorName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                                {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có sản phẩm trong đơn hàng</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={handleCloseOrderModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewContracts;


