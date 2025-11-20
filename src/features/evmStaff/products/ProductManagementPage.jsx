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
} from '../../../api/admin/modelApi';
import {
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

  const { data: modelsData, isLoading: isLoadingModels } = useGetAllModelsQuery();
  const { data: colorsData } = useGetAllColorsQuery();
  const { data: modelColorsData } = useGetModelColorsByModelQuery(selectedModel?.modelId, {
    skip: !selectedModel,
  });
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetAllInventoryTransactionsQuery();
  const { data: statusesData } = useGetInventoryTransactionStatusesQuery();
  
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
  const modelColors = modelColorsData?.data || [];
  const transactions = transactionsData?.data || [];
  const statuses = statusesData?.data || [];

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
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'default', label: 'Inactive' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    try {
      await createModel({
        ...modelFormData,
        modelYear: parseInt(modelFormData.modelYear),
        batteryCapacity: parseFloat(modelFormData.batteryCapacity),
        range: parseFloat(modelFormData.range),
        powerHp: parseFloat(modelFormData.powerHp),
        torqueNm: parseFloat(modelFormData.torqueNm),
        acceleration: parseFloat(modelFormData.acceleration),
        seatingCapacity: parseInt(modelFormData.seatingCapacity),
      }).unwrap();
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
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo model');
      console.error(error);
    }
  };

  const handleEditModel = (model) => {
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
    try {
      await updateModel({
        id: selectedModel.modelId,
        ...modelFormData,
        modelYear: parseInt(modelFormData.modelYear),
        batteryCapacity: parseFloat(modelFormData.batteryCapacity),
        range: parseFloat(modelFormData.range),
        powerHp: parseFloat(modelFormData.powerHp),
        torqueNm: parseFloat(modelFormData.torqueNm),
        acceleration: parseFloat(modelFormData.acceleration),
        seatingCapacity: parseInt(modelFormData.seatingCapacity),
      }).unwrap();
      setIsEditModelModalOpen(false);
      setSelectedModel(null);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật model');
      console.error(error);
    }
  };

  const handleDeleteModel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa model này?')) {
      try {
        await deleteModel(id).unwrap();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa model');
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

  if (isLoadingModels) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
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
            <p className="text-gray-600 mt-1">Quản lý models, color variants và inventory transactions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showInventoryTransactions ? 'outline' : 'primary'}
              onClick={() => setShowInventoryTransactions(!showInventoryTransactions)}
            >
              {showInventoryTransactions ? 'Quản lý Models' : 'Quản lý Inventory Transactions'}
            </Button>
            {!showInventoryTransactions && (
              <Button onClick={() => setIsCreateModelModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Add New Model
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
                    placeholder="Search by model name, code..."
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
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === 'inactive'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Inactive
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
                  <Table.Head>Model Code</Table.Head>
                  <Table.Head>Model Name</Table.Head>
                  <Table.Head>Brand</Table.Head>
                  <Table.Head>Base Price</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head className="text-center">Actions</Table.Head>
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
                    <Table.Cell>Electra</Table.Cell>
                    <Table.Cell>
                      {formatCurrency(model.basePrice || modelColors.find(mc => mc.modelId === model.modelId)?.price)}
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(model.status)}</Table.Cell>
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
                Color Variants for {selectedModel.modelName}
              </h2>
              <Button onClick={() => setIsCreateColorModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                Add New Color
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Image</Table.Head>
                    <Table.Head>Color Name</Table.Head>
                    <Table.Head>Color Code</Table.Head>
                    <Table.Head>Price</Table.Head>
                    <Table.Head>Quantity</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head className="text-center">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {modelColors.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} className="text-center text-gray-500 py-8">
                        Chưa có color variants cho model này
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
                                <span className="text-xs text-gray-400">No image</span>
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
                          <Table.Cell>{formatCurrency(mc.price)}</Table.Cell>
                          <Table.Cell>{mc.quantity || 0}</Table.Cell>
                          <Table.Cell>{getStatusBadge(mc.status || 'ACTIVE')}</Table.Cell>
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
        title="Add New Model"
        size="lg"
      >
        <form onSubmit={handleCreateModel} className="space-y-4">
          <Input
            label="Model Name"
            value={modelFormData.modelName}
            onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Model Year"
              type="number"
              value={modelFormData.modelYear}
              onChange={(e) => setModelFormData({ ...modelFormData, modelYear: e.target.value })}
              required
            />
            <Input
              label="Battery Capacity (kWh)"
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
              label="Range (km)"
              type="number"
              value={modelFormData.range}
              onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })}
              required
            />
            <Input
              label="Power (HP)"
              type="number"
              step="0.1"
              value={modelFormData.powerHp}
              onChange={(e) => setModelFormData({ ...modelFormData, powerHp: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Torque (Nm)"
              type="number"
              step="0.1"
              value={modelFormData.torqueNm}
              onChange={(e) => setModelFormData({ ...modelFormData, torqueNm: e.target.value })}
              required
            />
            <Input
              label="Acceleration (0-100km/h)"
              type="number"
              step="0.1"
              value={modelFormData.acceleration}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, acceleration: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Seating Capacity"
            type="number"
            value={modelFormData.seatingCapacity}
            onChange={(e) =>
              setModelFormData({ ...modelFormData, seatingCapacity: e.target.value })
            }
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModelModalOpen(false)}
              className="flex-1"
              disabled={isCreatingModel}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreatingModel}>
              {isCreatingModel ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Color Variant Modal */}
      <Modal
        isOpen={isCreateColorModalOpen}
        onClose={() => setIsCreateColorModalOpen(false)}
        title="Add New Color"
        size="md"
      >
        <form onSubmit={handleCreateColor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
            <Dropdown
              options={colors.map((color) => ({
                value: color.colorId?.toString(),
                label: color.colorName || `Color ${color.colorId}`,
              }))}
              value={colorFormData.colorId}
              onChange={(value) => setColorFormData({ ...colorFormData, colorId: value })}
              placeholder="Select color"
            />
          </div>
          <Input
            label="Price"
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
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreatingColor}>
              {isCreatingColor ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </EVMStaffLayout>
  );
};

export default ProductManagementPage;

