import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetAllModelsQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetBodyTypesQuery,
} from '../../../api/admin/modelApi';
import {
  useGetAllModelColorsQuery,
  useGetModelColorsByModelQuery,
  useCreateModelColorMutation,
  useUpdateModelColorMutation,
  useDeleteModelColorMutation,
} from '../../../api/evmStaff/productApi';
import { useGetAllColorsQuery } from '../../../api/evmStaff/colorApi';
import {
  useGetAllInventoryTransactionsQuery,
  useCreateInventoryTransactionMutation,
  useAcceptInventoryRequestMutation,
  useRejectInventoryRequestMutation,
  useStartShippingMutation,
  useConfirmDeliveryMutation,
  useGetInventoryTransactionStatusesQuery,
} from '../../../api/evmStaff/inventoryApi';

const ProductManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isCreateModelModalOpen, setIsCreateModelModalOpen] = useState(false);
  const [isCreateColorModalOpen, setIsCreateColorModalOpen] = useState(false);
  const [isEditModelModalOpen, setIsEditModelModalOpen] = useState(false);
  const [showInventoryTransactions, setShowInventoryTransactions] = useState(false);
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [modelFormData, setModelFormData] = useState({
    modelName: '',
    modelYear: '',
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: '',
    bodyType: '',
    description: '',
  });
  const [colorFormData, setColorFormData] = useState({
    modelId: null,
    colorId: '',
    price: '',
  });

  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: colorsData, error: colorsError } = useGetAllColorsQuery();
  const { data: bodyTypesData } = useGetBodyTypesQuery();
  // Load tất cả model colors để hiển thị giá trong bảng
  const { data: allModelColorsData } = useGetAllModelColorsQuery();
  const { data: modelColorsData, error: modelColorsError } = useGetModelColorsByModelQuery(selectedModel?.modelId, {
    skip: !selectedModel,
  });
  // Chỉ call API inventory transactions khi đang ở chế độ quản lý inventory transactions
  const { data: transactionsData, isLoading: isLoadingTransactions, error: transactionsError } = useGetAllInventoryTransactionsQuery(undefined, {
    skip: !showInventoryTransactions,
  });
  const { data: statusesData, error: statusesError } = useGetInventoryTransactionStatusesQuery(undefined, {
    skip: !showInventoryTransactions,
  });
  
  const [createTransaction] = useCreateInventoryTransactionMutation();
  const [acceptRequest] = useAcceptInventoryRequestMutation();
  const [rejectRequest] = useRejectInventoryRequestMutation();
  const [startShipping] = useStartShippingMutation();
  const [confirmDelivery] = useConfirmDeliveryMutation();

  const [createModel, { isLoading: isCreatingModel }] = useCreateModelMutation();
  const [updateModel, { isLoading: isUpdatingModel }] = useUpdateModelMutation();
  const [deleteModel] = useDeleteModelMutation();
  const [createModelColor, { isLoading: isCreatingColor }] = useCreateModelColorMutation();
  const [updateModelColor] = useUpdateModelColorMutation();
  const [deleteModelColor] = useDeleteModelColorMutation();

  const models = modelsData?.data || [];
  const colors = colorsData?.data || [];
  const bodyTypes = bodyTypesData?.data || [];
  const allModelColors = allModelColorsData?.data || []; // Tất cả model colors để hiển thị giá
  const modelColors = modelColorsData?.data || []; // Model colors của model được chọn
  const transactions = transactionsData?.data || [];
  const statuses = statusesData?.data || [];

  // Tạo map để tìm giá nhanh: modelId -> price (lấy giá đầu tiên hoặc giá thấp nhất)
  const modelPriceMap = useMemo(() => {
    const map = new Map();
    allModelColors.forEach((mc) => {
      if (!map.has(mc.modelId) || (map.get(mc.modelId) > mc.price)) {
        map.set(mc.modelId, mc.price);
      }
    });
    return map;
  }, [allModelColors]);

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.modelId?.toString().includes(searchTerm);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && model.status === 'ACTIVE') ||
        (statusFilter === 'inactive' && model.status === 'INACTIVE');
      return matchesSearch && matchesStatus;
    });
  }, [models, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    // Nếu không có status, mặc định là ACTIVE
    const normalizedStatus = status?.toUpperCase() || 'ACTIVE';
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Hoạt động' },
      INACTIVE: { variant: 'default', label: 'Không hoạt động' },
    };
    const config = statusMap[normalizedStatus] || { variant: 'default', label: normalizedStatus || 'Hoạt động' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!modelFormData.modelName?.trim()) {
      showNotification('Vui lòng nhập tên xe', 'error');
      return;
    }
    if (!modelFormData.modelYear || isNaN(parseInt(modelFormData.modelYear))) {
      showNotification('Vui lòng nhập năm sản xuất hợp lệ', 'error');
      return;
    }
    if (!modelFormData.bodyType) {
      showNotification('Vui lòng chọn kiểu dáng', 'error');
      return;
    }

    // Helper function để parse số
    const parseNumber = (value) => {
      if (!value || value === '') return null;
      const normalized = String(value).replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? null : parsed;
    };

    const parseInteger = (value) => {
      if (!value || value === '') return null;
      const normalized = String(value).replace(',', '.');
      const parsed = parseInt(normalized);
      return isNaN(parsed) ? null : parsed;
    };

    try {
      const createData = {
        modelName: modelFormData.modelName.trim(),
        modelYear: parseInt(modelFormData.modelYear),
        bodyType: modelFormData.bodyType,
      };

      const batteryCapacity = parseNumber(modelFormData.batteryCapacity);
      if (batteryCapacity !== null) {
        createData.batteryCapacity = batteryCapacity;
      }
      
      const range = parseNumber(modelFormData.range);
      if (range !== null) {
        createData.range = range;
      }
      
      const powerHp = parseNumber(modelFormData.powerHp);
      if (powerHp !== null) {
        createData.powerHp = powerHp;
      }
      
      const torqueNm = parseNumber(modelFormData.torqueNm);
      if (torqueNm !== null) {
        createData.torqueNm = torqueNm;
      }
      
      const acceleration = parseNumber(modelFormData.acceleration);
      if (acceleration !== null) {
        createData.acceleration = acceleration;
      }
      
      const seatingCapacity = parseInteger(modelFormData.seatingCapacity);
      if (seatingCapacity !== null) {
        createData.seatingCapacity = seatingCapacity;
      }

      if (modelFormData.description?.trim()) {
        createData.description = modelFormData.description.trim();
      }

      await createModel(createData).unwrap();
      setIsCreateModelModalOpen(false);
      setModelFormData({
        modelName: '',
        modelYear: '',
        batteryCapacity: '',
        range: '',
        powerHp: '',
        torqueNm: '',
        acceleration: '',
        seatingCapacity: '',
        bodyType: '',
        description: '',
      });
      showNotification('Tạo xe thành công!', 'success');
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi tạo xe';
      
      if (error?.data) {
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          errorMessage = error.data.error;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.errors) {
          const errors = Array.isArray(error.data.errors) 
            ? error.data.errors.join(', ') 
            : Object.values(error.data.errors).join(', ');
          errorMessage = errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      console.error('Create error details:', {
        error,
        status: error?.status,
        data: error?.data,
      });
    }
  };

  const handleEditModel = (model) => {
    // Set selectedModel trước để đảm bảo dữ liệu được load
    setSelectedModel(model);
    // Load dữ liệu từ model vào form
    setModelFormData({
      modelName: model.modelName || '',
      modelYear: model.modelYear?.toString() || '',
      batteryCapacity: model.batteryCapacity?.toString() || '',
      range: model.range?.toString() || '',
      powerHp: model.powerHp?.toString() || '',
      torqueNm: model.torqueNm?.toString() || '',
      acceleration: model.acceleration?.toString() || '',
      seatingCapacity: model.seatingCapacity?.toString() || '',
      bodyType: model.bodyType || '',
      description: model.description || '',
    });
    setIsEditModelModalOpen(true);
  };

  const handleUpdateModel = async (e) => {
    e.preventDefault();
    if (!selectedModel) {
      showNotification('Vui lòng chọn xe để cập nhật', 'error');
      return;
    }

    // Validation
    if (!modelFormData.modelName?.trim()) {
      showNotification('Vui lòng nhập tên xe', 'error');
      return;
    }
    if (!modelFormData.modelYear || isNaN(parseInt(modelFormData.modelYear))) {
      showNotification('Vui lòng nhập năm sản xuất hợp lệ', 'error');
      return;
    }
    if (!modelFormData.bodyType) {
      showNotification('Vui lòng chọn kiểu dáng', 'error');
      return;
    }

    try {
      // Parse các giá trị số, xử lý trường hợp rỗng hoặc không hợp lệ
      const updateData = {
        id: selectedModel.modelId,
        modelName: modelFormData.modelName.trim(),
        modelYear: parseInt(modelFormData.modelYear),
        bodyType: modelFormData.bodyType,
      };

      // Helper function để parse số, xử lý cả dấu phẩy và dấu chấm
      const parseNumber = (value) => {
        if (!value || value === '') return null;
        // Thay dấu phẩy bằng dấu chấm để parse
        const normalized = String(value).replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed;
      };

      const parseInteger = (value) => {
        if (!value || value === '') return null;
        const normalized = String(value).replace(',', '.');
        const parsed = parseInt(normalized);
        return isNaN(parsed) ? null : parsed;
      };

      // Chỉ thêm các field số nếu có giá trị hợp lệ
      const batteryCapacity = parseNumber(modelFormData.batteryCapacity);
      if (batteryCapacity !== null) {
        updateData.batteryCapacity = batteryCapacity;
      }
      
      const range = parseNumber(modelFormData.range);
      if (range !== null) {
        updateData.range = range;
      }
      
      const powerHp = parseNumber(modelFormData.powerHp);
      if (powerHp !== null) {
        updateData.powerHp = powerHp;
      }
      
      const torqueNm = parseNumber(modelFormData.torqueNm);
      if (torqueNm !== null) {
        updateData.torqueNm = torqueNm;
      }
      
      const acceleration = parseNumber(modelFormData.acceleration);
      if (acceleration !== null) {
        updateData.acceleration = acceleration;
      }
      
      const seatingCapacity = parseInteger(modelFormData.seatingCapacity);
      if (seatingCapacity !== null) {
        updateData.seatingCapacity = seatingCapacity;
      }
      if (modelFormData.description?.trim()) {
        updateData.description = modelFormData.description.trim();
      }

      await updateModel(updateData).unwrap();
      setIsEditModelModalOpen(false);
      setSelectedModel(null);
      setModelFormData({
        modelName: '',
        modelYear: '',
        batteryCapacity: '',
        range: '',
        powerHp: '',
        torqueNm: '',
        acceleration: '',
        seatingCapacity: '',
        bodyType: '',
        description: '',
      });
      showNotification('Cập nhật xe thành công!', 'success');
    } catch (error) {
      // Xử lý lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi cập nhật xe';
      
      if (error?.data) {
        // Nếu có message từ API
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.error) {
          errorMessage = error.data.error;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.errors) {
          // Nếu có nhiều lỗi validation
          const errors = Array.isArray(error.data.errors) 
            ? error.data.errors.join(', ') 
            : Object.values(error.data.errors).join(', ');
          errorMessage = errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      console.error('Update error details:', {
        error,
        status: error?.status,
        data: error?.data,
        originalStatus: error?.originalStatus,
      });
    }
  };

  const handleDeleteModel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        await deleteModel(id).unwrap();
        showNotification('Xóa xe thành công!', 'success');
      } catch (error) {
        const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi xóa xe';
        showNotification(errorMessage, 'error');
        console.error(error);
      }
    }
  };

  const handleCreateColor = async (e) => {
    e.preventDefault();
    if (!selectedModel) {
      alert('Vui lòng chọn model trước');
      return;
    }
    try {
      await createModelColor({
        modelId: selectedModel.modelId,
        colorId: parseInt(colorFormData.colorId),
        price: parseFloat(colorFormData.price),
      }).unwrap();
      setIsCreateColorModalOpen(false);
      setColorFormData({
        modelId: null,
        colorId: '',
        price: '',
      });
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo color variant');
      console.error(error);
    }
  };

  const handleDeleteColor = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa color variant này?')) {
      try {
        await deleteModelColor(id).unwrap();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa color variant');
        console.error(error);
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyVND = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesStatus = transactionStatusFilter === 'all' || transaction.status === transactionStatusFilter;
      return matchesStatus;
    });
  }, [transactions, transactionStatusFilter]);

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ xử lý' },
      ACCEPTED: { variant: 'info', label: 'Đã chấp nhận' },
      REJECTED: { variant: 'error', label: 'Đã từ chối' },
      SHIPPING: { variant: 'info', label: 'Đang vận chuyển' },
      DELIVERED: { variant: 'success', label: 'Đã giao' },
      CANCELLED: { variant: 'default', label: 'Đã hủy' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAcceptTransaction = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn chấp nhận yêu cầu này?')) {
      try {
        await acceptRequest(inventoryId).unwrap();
        alert('Đã chấp nhận yêu cầu thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi chấp nhận yêu cầu');
        console.error(error);
      }
    }
  };

  const handleRejectTransaction = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      try {
        await rejectRequest(inventoryId).unwrap();
        alert('Đã từ chối yêu cầu thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi từ chối yêu cầu');
        console.error(error);
      }
    }
  };

  const handleStartShipping = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu vận chuyển?')) {
      try {
        await startShipping(inventoryId).unwrap();
        alert('Đã bắt đầu vận chuyển thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi bắt đầu vận chuyển');
        console.error(error);
      }
    }
  };

  const handleConfirmDelivery = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận đã giao hàng?')) {
      try {
        await confirmDelivery(inventoryId).unwrap();
        alert('Đã xác nhận giao hàng thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi xác nhận giao hàng');
        console.error(error);
      }
    }
  };

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    modelsError?.status === 401 || 
    colorsError?.status === 401 ||
    modelColorsError?.status === 401 ||
    (showInventoryTransactions && (transactionsError?.status === 401 || statusesError?.status === 401));

  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </EVMStaffLayout>
    );
  }

  const isLoading = isLoadingModels || (showInventoryTransactions && isLoadingTransactions);

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Kiểm tra lỗi khác
  const hasError = 
    (modelsError && modelsError.status !== 401) ||
    (colorsError && colorsError.status !== 401) ||
    (modelColorsError && modelColorsError.status !== 401) ||
    (showInventoryTransactions && transactionsError && transactionsError.status !== 401) ||
    (showInventoryTransactions && statusesError && statusesError.status !== 401);

  if (hasError) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </EVMStaffLayout>
    );
  }

  return (
    <EVMStaffLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý xe, biến thể màu và giao dịch kho</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showInventoryTransactions ? 'outline' : 'primary'}
              onClick={() => setShowInventoryTransactions(!showInventoryTransactions)}
            >
              {showInventoryTransactions ? 'Quản lý Xe' : 'Quản lý Giao dịch Kho'}
            </Button>
            {!showInventoryTransactions && (
              <Button onClick={() => setIsCreateModelModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Thêm xe mới
              </Button>
            )}
          </div>
        </div>

        {/* Inventory Transactions Section */}
        {showInventoryTransactions ? (
          <>
            {/* Search and Filters for Transactions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Tìm kiếm theo mã transaction, tên model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dropdown
                  options={[
                    { value: 'all', label: 'Trạng thái: Tất cả' },
                    ...statuses.map((status) => ({
                      value: status,
                      label: status,
                    })),
                  ]}
                  value={transactionStatusFilter}
                  onChange={setTransactionStatusFilter}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {isLoadingTransactions ? (
                <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>MÃ TRANSACTION</Table.Head>
                        <Table.Head>MODEL</Table.Head>
                        <Table.Head>MÀU</Table.Head>
                        <Table.Head>ĐẠI LÝ</Table.Head>
                        <Table.Head>SỐ LƯỢNG</Table.Head>
                        <Table.Head>TỔNG GIÁ</Table.Head>
                        <Table.Head>NGÀY TẠO</Table.Head>
                        <Table.Head>TRẠNG THÁI</Table.Head>
                        <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredTransactions.map((transaction) => (
                        <Table.Row key={transaction.inventoryId}>
                          <Table.Cell className="font-mono">#{transaction.inventoryId}</Table.Cell>
                          <Table.Cell>{transaction.modelName || 'N/A'}</Table.Cell>
                          <Table.Cell>{transaction.colorName || 'N/A'}</Table.Cell>
                          <Table.Cell>{transaction.storeName || 'N/A'}</Table.Cell>
                          <Table.Cell>{transaction.importQuantity || 0}</Table.Cell>
                          <Table.Cell className="font-medium">
                            {formatCurrencyVND(transaction.totalPrice || 0)}
                          </Table.Cell>
                          <Table.Cell>{formatDate(transaction.orderDate)}</Table.Cell>
                          <Table.Cell>{getTransactionStatusBadge(transaction.status)}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center justify-center gap-2">
                              {transaction.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptTransaction(transaction.inventoryId)}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                  >
                                    Chấp nhận
                                  </button>
                                  <button
                                    onClick={() => handleRejectTransaction(transaction.inventoryId)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {transaction.status === 'ACCEPTED' && (
                                <button
                                  onClick={() => handleStartShipping(transaction.inventoryId)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                >
                                  Bắt đầu vận chuyển
                                </button>
                              )}
                              {transaction.status === 'SHIPPING' && (
                                <button
                                  onClick={() => handleConfirmDelivery(transaction.inventoryId)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                >
                                  Xác nhận giao hàng
                                </button>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Search and Filters for Models */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Tìm kiếm theo tên xe, mã..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Hoạt động
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === 'inactive'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Không hoạt động
                  </button>
                </div>
              </div>
            </div>

        {/* Models Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Mã xe</Table.Head>
                  <Table.Head>Tên xe</Table.Head>
                  <Table.Head>Giá cơ bản</Table.Head>
                  <Table.Head className="text-center">Hành động</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredModels.map((model) => (
                  <Table.Row
                    key={model.modelId}
                    className={selectedModel?.modelId === model.modelId ? 'bg-blue-50' : ''}
                    onClick={() => setSelectedModel(model)}
                  >
                    <Table.Cell className="font-mono">ELEC-{model.modelId}</Table.Cell>
                    <Table.Cell className="font-medium">{model.modelName}</Table.Cell>
                    <Table.Cell>
                      {formatCurrency(model.basePrice || modelPriceMap.get(model.modelId) || 0)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModel(model);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModel(model.modelId);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Color Variants Section */}
        {selectedModel && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Biến thể màu cho {selectedModel.modelName}
              </h2>
              <Button onClick={() => setIsCreateColorModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Thêm màu mới
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Hình ảnh</Table.Head>
                    <Table.Head>Tên màu</Table.Head>
                    <Table.Head>Mã màu</Table.Head>
                    <Table.Head className="text-center">Hành động</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {modelColors.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} className="text-center text-gray-500 py-8">
                        Chưa có biến thể màu cho model này
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    modelColors.map((mc) => {
                      const color = colors.find((c) => c.colorId === mc.colorId);
                      return (
                        <Table.Row key={mc.modelColorId}>
                          <Table.Cell>
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              {mc.imagePath ? (
                                <img
                                  src={mc.imagePath}
                                  alt={color?.colorName}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">Không có hình ảnh</span>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>{color?.colorName || 'N/A'}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color?.colorCode || '#000' }}
                              />
                              <span className="font-mono text-sm">{color?.colorCode || 'N/A'}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteColor(mc.modelColorId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Create Model Modal */}
      <Modal
        isOpen={isCreateModelModalOpen}
        onClose={() => setIsCreateModelModalOpen(false)}
        title="Thêm xe mới"
        size="lg"
      >
        <form onSubmit={handleCreateModel} className="space-y-4">
          <Input
            label="Tên xe"
            value={modelFormData.modelName}
            onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Năm sản xuất"
              type="number"
              value={modelFormData.modelYear}
              onChange={(e) => setModelFormData({ ...modelFormData, modelYear: e.target.value })}
              required
            />
            <Input
              label="Dung lượng pin (kWh)"
              type="number"
              step="0.1"
              value={modelFormData.batteryCapacity}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, batteryCapacity: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quãng đường (km)"
              type="number"
              value={modelFormData.range}
              onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })}
              required
            />
            <Input
              label="Công suất (HP)"
              type="number"
              step="0.1"
              value={modelFormData.powerHp}
              onChange={(e) => setModelFormData({ ...modelFormData, powerHp: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mô-men xoắn (Nm)"
              type="number"
              step="0.1"
              value={modelFormData.torqueNm}
              onChange={(e) => setModelFormData({ ...modelFormData, torqueNm: e.target.value })}
              required
            />
            <Input
              label="Gia tốc (0-100km/h)"
              type="number"
              step="0.1"
              value={modelFormData.acceleration}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, acceleration: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số chỗ ngồi"
              type="number"
              value={modelFormData.seatingCapacity}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, seatingCapacity: e.target.value })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dáng *</label>
              <Dropdown
                options={bodyTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                value={modelFormData.bodyType}
                onChange={(value) => setModelFormData({ ...modelFormData, bodyType: value })}
                placeholder="Chọn kiểu dáng"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={modelFormData.description}
              onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Nhập mô tả xe..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModelModalOpen(false)}
              className="flex-1"
              disabled={isCreatingModel}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreatingModel}>
              {isCreatingModel ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Model Modal */}
      <Modal
        isOpen={isEditModelModalOpen}
        onClose={() => {
          setIsEditModelModalOpen(false);
          setSelectedModel(null);
          setModelFormData({
            modelName: '',
            modelYear: '',
            batteryCapacity: '',
            range: '',
            powerHp: '',
            torqueNm: '',
            acceleration: '',
            seatingCapacity: '',
            bodyType: '',
            description: '',
          });
        }}
        title="Sửa xe"
        size="lg"
      >
        <form onSubmit={handleUpdateModel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={modelFormData.modelName}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Tên xe không thể chỉnh sửa</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Năm sản xuất"
              type="number"
              value={modelFormData.modelYear}
              onChange={(e) => setModelFormData({ ...modelFormData, modelYear: e.target.value })}
              required
            />
            <Input
              label="Dung lượng pin (kWh)"
              type="number"
              step="0.1"
              value={modelFormData.batteryCapacity}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, batteryCapacity: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quãng đường (km)"
              type="number"
              value={modelFormData.range}
              onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })}
              required
            />
            <Input
              label="Công suất (HP)"
              type="number"
              step="0.1"
              value={modelFormData.powerHp}
              onChange={(e) => setModelFormData({ ...modelFormData, powerHp: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mô-men xoắn (Nm)"
              type="number"
              step="0.1"
              value={modelFormData.torqueNm}
              onChange={(e) => setModelFormData({ ...modelFormData, torqueNm: e.target.value })}
              required
            />
            <Input
              label="Gia tốc (0-100km/h)"
              type="number"
              step="0.1"
              value={modelFormData.acceleration}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, acceleration: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số chỗ ngồi"
              type="number"
              value={modelFormData.seatingCapacity}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, seatingCapacity: e.target.value })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dáng *</label>
              <Dropdown
                options={bodyTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                value={modelFormData.bodyType}
                onChange={(value) => setModelFormData({ ...modelFormData, bodyType: value })}
                placeholder="Chọn kiểu dáng"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={modelFormData.description}
              onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Nhập mô tả xe..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModelModalOpen(false);
                setSelectedModel(null);
                setModelFormData({
                  modelName: '',
                  modelYear: '',
                  batteryCapacity: '',
                  range: '',
                  powerHp: '',
                  torqueNm: '',
                  acceleration: '',
                  seatingCapacity: '',
                  bodyType: '',
                  description: '',
                });
              }}
              className="flex-1"
              disabled={isUpdatingModel}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdatingModel}>
              {isUpdatingModel ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Color Variant Modal */}
      <Modal
        isOpen={isCreateColorModalOpen}
        onClose={() => setIsCreateColorModalOpen(false)}
        title="Thêm màu mới"
        size="md"
      >
        <form onSubmit={handleCreateColor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Màu *</label>
            <Dropdown
              options={colors.map((color) => ({
                value: color.colorId?.toString(),
                label: color.colorName || `Color ${color.colorId}`,
              }))}
              value={colorFormData.colorId}
              onChange={(value) => setColorFormData({ ...colorFormData, colorId: value })}
              placeholder="Chọn màu"
            />
          </div>
          <Input
            label="Giá"
            type="number"
            step="0.01"
            value={colorFormData.price}
            onChange={(e) => setColorFormData({ ...colorFormData, price: e.target.value })}
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateColorModalOpen(false)}
              className="flex-1"
              disabled={isCreatingColor}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreatingColor}>
              {isCreatingColor ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className="flex-1">
            {notification.message}
          </div>
          <button
            onClick={() => setNotification({ show: false, message: '', type: 'success' })}
            className="text-white hover:text-gray-200 font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </EVMStaffLayout>
  );
};

export default ProductManagementPage;

