import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Calendar, Download, Eye, Upload, FileText, CheckCircle, CreditCard, Banknote, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import MetricCard from '../../../components/shared/MetricCard';
import { useGetAllContractsQuery, useCreateContractMutation, useUploadSignedContractMutation, useGetContractDetailQuery } from '../../../api/dealerStaff/contractApi';
import { useGetAllOrdersQuery } from '../../../api/dealerStaff/orderApi';
import { formatCurrency, formatDate, getContractStatusConfig, getEffectiveContractStatus, getEffectiveRemainingAmount, isPaymentRequired } from '../../../utils/formatters';
import { getAuthFromStorage, getRoleFromPath } from '../../../utils/roleUtils';

const ContractManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [highlightContractId, setHighlightContractId] = useState(null);
  const toastShownRef = useRef(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: contractsData, isLoading, error } = useGetAllContractsQuery();
  const { data: ordersData } = useGetAllOrdersQuery();
  const [createContract, { isLoading: creatingContract }] = useCreateContractMutation();
  const [uploadSignedContract, { isLoading: uploadingContract }] = useUploadSignedContractMutation();

  const contracts = Array.isArray(contractsData?.data) ? contractsData.data : [];
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];

  // Handle highlighting from navigation state
  useEffect(() => {
    if (location.state?.highlightContractId && !toastShownRef.current) {
      setHighlightContractId(location.state.highlightContractId);
      
      // Show success toast for new contract (only once)
      if (location.state?.newContract) {
        toast.success('Đã tạo hợp đồng thành công!');
        toastShownRef.current = true;
      }
      
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightContractId(null);
        toastShownRef.current = false;
        // Clear navigation state
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.highlightContractId, location.state?.newContract, navigate, location.pathname, toast]);

  // Filter orders that can create contract (CONFIRMED status and no contract yet)
  const availableOrders = useMemo(() => {
    return orders.filter(order =>
      (order.status === 'CONFIRMED' || order.status === 'APPROVED') &&
      !order.contractId &&
      !contracts.some(c => c.orderId === order.orderId)
    );
  }, [orders, contracts]);

  // Filter and sort contracts (newest first)
  const filteredContracts = useMemo(() => {
    if (!Array.isArray(contracts)) return [];
    const filtered = contracts.filter((contract) => {
      const matchesSearch =
        contract.contractId?.toString().includes(searchTerm) ||
        contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.orderId?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort by contractId descending (newest first - higher ID = newer)
    return filtered.sort((a, b) => {
      return (b.contractId || 0) - (a.contractId || 0);
    });
  }, [contracts, searchTerm, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = contracts.length;
    const signed = contracts.filter(c => c.status === 'SIGNED' || c.status === 'DEPOSIT_SIGNED').length;
    const fullyPaid = contracts.filter(c => c.status === 'FULLY_PAID').length;
    const totalRevenue = contracts
      .filter(c => ['FULLY_PAID', 'COMPLETED'].includes(c.status))
      .reduce((sum, c) => sum + (c.totalPayment || 0), 0);

    return { total, signed, fullyPaid, totalRevenue };
  }, [contracts]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const getStatusBadge = (contract) => {
    const effectiveStatus = getEffectiveContractStatus(contract);
    const config = getContractStatusConfig(effectiveStatus);
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Helper function to check if contract has been uploaded
  const hasUploadedContract = (contract) => {
    const signedContractFileUrl = contract?.contractFileUrl || contract?.signedContractFileUrl;
    return signedContractFileUrl && 
           typeof signedContractFileUrl === 'string' && 
           signedContractFileUrl.trim().length > 0;
  };

  const handleCreateContract = async () => {
    if (!selectedOrder) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }

    try {
      const response = await createContract({ orderId: selectedOrder.orderId }).unwrap();
      toast.success('Đã tạo hợp đồng thành công!');
      setIsCreateModalOpen(false);
      setSelectedOrder(null);

      // Đã ở trang hợp đồng rồi, không cần điều hướng
      // Data sẽ tự động refresh do invalidatesTags
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };

  const handleViewContract = async (contract) => {
    const contractId = typeof contract === 'object' ? contract.contractId : contract;
    const contractObj = typeof contract === 'object' ? contract : null;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // Get auth token
      const currentPath = window.location.pathname;
      const roleFromPath = getRoleFromPath(currentPath);
      let token = null;

      if (roleFromPath) {
        const authData = getAuthFromStorage(roleFromPath);
        token = authData?.token;
      }

      // Always fetch contract detail to get latest signedContractFileUrl
      const detailResponse = await fetch(`${apiUrl}/contracts/detail/${contractId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      let signedContractFileUrl = null;

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const contractDetail = detailData?.data || detailData;
        // Check both contractFileUrl and signedContractFileUrl for compatibility
        signedContractFileUrl = contractDetail?.contractFileUrl || contractDetail?.signedContractFileUrl || null;

        // Check if signedContractFileUrl is a valid non-empty string
        const hasSignedContract = signedContractFileUrl &&
          typeof signedContractFileUrl === 'string' &&
          signedContractFileUrl.trim().length > 0;

        // If contract has signed file, open image in new tab
        if (hasSignedContract) {
          window.open(signedContractFileUrl, '_blank');
          return;
        }
      }

      // If no signed contract, fetch HTML and open in new tab
      const response = await fetch(`${apiUrl}/contracts/${contractId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }

      const htmlContent = await response.text();

      // Create blob URL and open in new tab
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      // Clean up blob URL after window opens
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 100);
        };
      } else {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Không thể tải hợp đồng');
    }
  };

  const handleOpenUploadModal = (contract) => {
    setSelectedContract(contract);
    setIsUploadModalOpen(true);
  };

  const handleUploadContract = async () => {
    if (!uploadFile) {
      toast.error('Vui lòng chọn file');
      return;
    }

    try {
      const response = await uploadSignedContract({
        contractId: selectedContract.contractId,
        file: uploadFile,
      }).unwrap();

      const uploadData = response?.data || response;
      toast.success(uploadData?.message || 'Đã upload hợp đồng thành công!');
      setIsUploadModalOpen(false);
      setSelectedContract(null);
      setUploadFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi upload hợp đồng');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF or images)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc hình ảnh (JPG, PNG)');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        return;
      }
      
      setUploadFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadFile(null);
    setPreviewUrl(null);
    setShowPreview(false);
    // Reset file input
    const fileInput = document.getElementById('contract-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleConfirmPreview = () => {
    setShowPreview(false);
  };

  const handleOpenPaymentModal = (contract) => {
    // Kiểm tra xem có cần thanh toán không
    if (!isPaymentRequired(contract.totalPayment)) {
      toast.error('Hợp đồng có tổng giá trị <= 5₫ không cần thanh toán');
      return;
    }

    // Kiểm tra xem hợp đồng đã được upload chưa
    if (!hasUploadedContract(contract)) {
      toast.error('Chỉ có thể tạo thanh toán khi hợp đồng đã được upload');
      return;
    }

    // Chỉ cho phép tạo thanh toán khi hợp đồng đã ký
    if (contract.status !== 'SIGNED' && contract.status !== 'DEPOSIT_PAID') {
      toast.error('Chỉ có thể tạo thanh toán khi hợp đồng đã được ký');
      return;
    }

    // Điều hướng đến trang thanh toán với contractId
    navigate('/dealer-staff/payments', { state: { contractId: contract.contractId } });
  };

  if (isLoading) {
    return (
      <DealerStaffLayout
        title="Quản lý Hợp đồng"
        description="Xem, tải lên và quản lý trạng thái các hợp đồng bán xe."
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSkeleton className="w-20 h-20" variant="circle" />
        </div>
      </DealerStaffLayout>
    );
  }

  if (error) {
    return (
      <DealerStaffLayout
        title="Quản lý Hợp đồng"
        description="Xem, tải lên và quản lý trạng thái các hợp đồng bán xe."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout
      title="Quản lý Hợp đồng"
      description="Xem, tải lên và quản lý trạng thái các hợp đồng bán xe."
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <MetricCard
            title="Tổng hợp đồng"
            value={stats.total}
            icon={FileText}
            className="border-l-4 border-l-blue-500 compact"
            compact
          />
          <MetricCard
            title="Đã ký"
            value={stats.signed}
            icon={CheckCircle}
            className="border-l-4 border-l-green-500 compact"
            compact
          />
        </div>

        {/* Toolbar & SearchBar */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 mb-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="w-full flex-1">
              <label className="flex flex-col min-w-40 h-10 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-slate-500 flex border border-slate-200 bg-slate-50 items-center justify-center pl-3 rounded-l-lg border-r-0">
                    <Search size={20} />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 bg-slate-50 h-full placeholder:text-slate-500 px-4 text-sm font-normal leading-normal"
                    placeholder="Tìm theo mã hợp đồng, tên khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div className="flex w-full items-center justify-end gap-2 md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="DRAFT">Nháp</option>
                <option value="SIGNED">Đã ký</option>
                <option value="DEPOSIT_PAID">Đã đặt cọc</option>
                <option value="FULLY_PAID">Đã thanh toán đủ</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
              <button className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <Calendar size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white ">
                {paginatedContracts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 ">
                    <thead className="bg-slate-50 ">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6" scope="col">
                          Mã Hợp Đồng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 " scope="col">
                          Tên Khách Hàng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 " scope="col">
                          Mã Đơn Hàng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 " scope="col">
                          Ngày Tạo
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 " scope="col">
                          Tổng Giá Trị
                        </th>
                        <th className="px-3 py-3.5 text-left pl-8 text-sm font-semibold text-slate-900 " scope="col">
                          Trạng thái
                        </th>
                        <th className="px-3 py-3.5 text pr-12 text-sm font-semibold text-slate-900 " scope="col">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white ">
                      {paginatedContracts.map((contract) => {
                        const isHighlighted = highlightContractId === contract.contractId;
                        return (
                        <motion.tr
                          key={contract.contractId}
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            backgroundColor: isHighlighted ? '#fef3c7' : 'transparent'
                          }}
                          className={`transition-colors ${
                            isHighlighted 
                              ? 'bg-yellow-100 border-l-4 border-l-yellow-500 shadow-md' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                            <button
                              onClick={() => handleViewContract(contract)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {contract.contractCode || `HD-${contract.contractId}`}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 ">
                            {contract.customerName || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <button
                              onClick={() => navigate('/dealer-staff/orders', {
                                state: {
                                  orderId: contract.orderId,
                                  openOrderDetail: true
                                }
                              })}
                              className="text-primary hover:underline font-medium"
                              title="Xem chi tiết đơn hàng"
                            >
                              {contract.orderCode || `DH-${contract.orderId}`}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 ">
                            {formatDate(contract.contractDate || contract.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-900 ">
                            {formatCurrency(contract.totalPayment || 0)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {getStatusBadge(contract)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedContract(contract);
                                  handleViewContract(contract);
                                }}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem hợp đồng"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  if (!hasUploadedContract(contract)) {
                                    handleOpenUploadModal(contract);
                                  }
                                }}
                                disabled={hasUploadedContract(contract)}
                                className={`p-2 rounded-lg transition-colors ${
                                  hasUploadedContract(contract)
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                                title={hasUploadedContract(contract) ? "Hợp đồng đã được upload" : "Upload hợp đồng đã ký"}
                              >
                                <Upload size={18} />
                              </button>
                              {isPaymentRequired(contract.totalPayment) && getEffectiveRemainingAmount(contract) > 0 && hasUploadedContract(contract) && (
                                <button
                                  onClick={() => {
                                    handleOpenPaymentModal(contract);
                                  }}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Tạo thanh toán"
                                >
                                  <CreditCard size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )})}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-900">{startIndex + 1}</span> đến{' '}
              <span className="font-medium text-slate-900">{Math.min(endIndex, filteredContracts.length)}</span> của{' '}
              <span className="font-medium text-slate-900">{filteredContracts.length}</span> kết quả
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Trang trước
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Tạo hợp đồng từ đơn hàng"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 ">
            Chọn đơn hàng đã được xác nhận để tạo hợp đồng
          </p>

          {availableOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không có đơn hàng nào sẵn sàng để tạo hợp đồng
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableOrders.map((order) => (
                <motion.div
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOrder?.orderId === order.orderId
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-primary/50'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900 ">
                        Đơn hàng #{order.orderId}
                      </p>
                      <p className="text-sm text-slate-600 ">
                        {order.customerName} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatCurrency(order.totalAmount || order.totalPayment)}
                      </p>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateContract}
              disabled={!selectedOrder || creatingContract}
            >
              {creatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Contract Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedContract(null);
          setUploadFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(null);
          setShowPreview(false);
        }}
        title="Upload hợp đồng đã ký"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload file hợp đồng đã ký bởi khách hàng (PDF hoặc hình ảnh)
          </p>

          {!showPreview ? (
            // File Selection Step
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto text-slate-400 mb-4" size={48} />
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="contract-upload"
              />
              <label
                htmlFor="contract-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Chọn file
              </label>
              <p className="text-sm text-slate-500 mt-2">
                PDF, JPG, PNG (tối đa 10MB)
              </p>
            </div>
          ) : (
            // Preview Step
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-900">Xem trước file đã chọn:</h4>
                <p className="text-sm text-slate-600">{uploadFile?.name}</p>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                {uploadFile?.type === 'application/pdf' ? (
                  // PDF Preview
                  <div className="text-center py-8">
                    <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-sm font-medium text-slate-700">File PDF</p>
                    <p className="text-xs text-slate-500 mt-1">{uploadFile.name}</p>
                    <p className="text-xs text-slate-500">
                      Kích thước: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  // Image Preview
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-96 rounded-lg shadow-sm"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelPreview}
                  className="flex-1"
                >
                  Chọn file khác
                </Button>
                <Button
                  onClick={handleConfirmPreview}
                  className="flex-1"
                >
                  Xác nhận file này
                </Button>
              </div>
            </div>
          )}

          {/* Upload confirmation step */}
          {uploadFile && !showPreview && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    File đã được xác nhận: {uploadFile.name}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Kích thước: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelPreview}
                  className="text-slate-600 hover:text-slate-800"
                >
                  Thay đổi
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedContract(null);
                setUploadFile(null);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setShowPreview(false);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUploadContract}
              disabled={!uploadFile || uploadingContract || showPreview}
            >
              {uploadingContract ? 'Đang upload...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

    </DealerStaffLayout>
  );
};

export default ContractManagementPage;
