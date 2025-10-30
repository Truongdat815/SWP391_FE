import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  fetchContracts,
  uploadSignedContractThunk
} from '../../store/slices/contractSlice';
import { getContractHtml } from '../../api/contractService';
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
  X
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

  // Load contracts on mount
  useEffect(() => {
    dispatch(fetchContracts());
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
      
      // Refresh contracts list
      setTimeout(() => {
        dispatch(fetchContracts());
        setSuccessMessage(null);
      }, 2000);
      
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
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải hợp đồng...</span>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12">
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
                    Đã upload
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
                      #{contract.contractId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.orderCode || `ORD-${contract.orderId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.customerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{contract.customerPhone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.contractDate ? new Date(contract.contractDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.signedContractFileUrl ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
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
            className="w-full max-w-md p-6 border shadow-2xl rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Hợp Đồng Đã Ký
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Mã hợp đồng: <span className="font-semibold">#{selectedContract.contractId}</span>
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
    </div>
  );
}

export default ViewContracts;

