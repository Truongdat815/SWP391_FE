import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Box, Layers, ChevronRight, Package, Truck, Zap, Battery, Gauge, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  useUploadModelColorImageMutation,
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
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [selectedModelColor, setSelectedModelColor] = useState(null);
  const [isDeleteColorModalOpen, setIsDeleteColorModalOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
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
  const [colorImageFile, setColorImageFile] = useState(null);
  const [uploadImageFile, setUploadImageFile] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Track current image index for each model
  const imageIntervalRefs = useRef({}); // Store interval refs for cleanup

  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: colorsData, error: colorsError } = useGetAllColorsQuery();
  const { data: bodyTypesData } = useGetBodyTypesQuery();
  const { data: allModelColorsData } = useGetAllModelColorsQuery();
  const { data: modelColorsData, error: modelColorsError, refetch: refetchModelColors } = useGetModelColorsByModelQuery(selectedModel?.modelId, {
    skip: !selectedModel,
  });
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
  const [uploadModelColorImage, { isLoading: isUploadingImage }] = useUploadModelColorImageMutation();
  const [updateModelColor] = useUpdateModelColorMutation();
  const [deleteModelColor] = useDeleteModelColorMutation();

  const models = modelsData?.data || [];
  const colors = colorsData?.data || [];
  const bodyTypes = bodyTypesData?.data || [];
  const allModelColors = allModelColorsData?.data || [];
  const modelColors = modelColorsData?.data || [];
  const transactions = transactionsData?.data || [];
  const statuses = statusesData?.data || [];

  const modelPriceMap = useMemo(() => {
    const map = new Map();
    allModelColors.forEach((mc) => {
      if (!map.has(mc.modelId) || (map.get(mc.modelId) > mc.price)) {
        map.set(mc.modelId, mc.price);
      }
    });
    return map;
  }, [allModelColors]);

  // Get images for each model (from model colors)
  const modelImagesMap = useMemo(() => {
    const map = new Map();
    allModelColors.forEach((mc) => {
      const imageUrl = mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile;
      if (imageUrl) {
        if (!map.has(mc.modelId)) {
          map.set(mc.modelId, []);
        }
        map.get(mc.modelId).push({
          imageUrl,
          colorId: mc.colorId,
          colorName: colors.find((c) => c.colorId === mc.colorId)?.colorName || 'N/A',
        });
      }
    });
    return map;
  }, [allModelColors, colors]);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.modelId?.toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [models, searchTerm]);

  // Auto-rotate images for each model
  useEffect(() => {
    // Initialize indices for all models with images
    filteredModels.forEach((model) => {
      const images = modelImagesMap.get(model.modelId) || [];
      if (images.length > 0) {
        setCurrentImageIndex((prev) => {
          if (prev[model.modelId] === undefined) {
            return { ...prev, [model.modelId]: 0 };
          }
          return prev;
        });
      }
    });

    // Set up intervals for models with multiple images
    filteredModels.forEach((model) => {
      const images = modelImagesMap.get(model.modelId) || [];
      if (images.length > 1) {
        // Clear existing interval if any
        if (imageIntervalRefs.current[model.modelId]) {
          clearInterval(imageIntervalRefs.current[model.modelId]);
        }

        // Set up interval to rotate images
        const intervalId = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const currentIdx = prev[model.modelId] || 0;
            const images = modelImagesMap.get(model.modelId) || [];
            if (images.length > 0) {
              const nextIdx = (currentIdx + 1) % images.length;
              return { ...prev, [model.modelId]: nextIdx };
            }
            return prev;
          });
        }, 3500); // Change image every 3.5 seconds

        imageIntervalRefs.current[model.modelId] = intervalId;
      }
    });

    // Cleanup intervals on unmount or when models/images change
    return () => {
      Object.values(imageIntervalRefs.current).forEach((intervalId) => {
        if (intervalId) clearInterval(intervalId);
      });
      imageIntervalRefs.current = {};
    };
  }, [filteredModels, modelImagesMap]);

  const getStatusBadge = (status) => {
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
    if (!modelFormData.modelName?.trim()) {
      showNotification('Vui lòng nhập tên xe', 'error');
      return;
    }
    if (!modelFormData.modelYear || isNaN(parseInt(modelFormData.modelYear))) {
      showNotification('Vui lòng nhập năm sản xuất hợp lệ', 'error');
      return;
    }
    
    // Validation năm sản xuất
    const currentYear = new Date().getFullYear();
    const modelYear = parseInt(modelFormData.modelYear);
    if (modelYear < 2000 || modelYear > currentYear + 1) {
      showNotification(`Năm sản xuất phải từ 2000 đến ${currentYear + 1}`, 'error');
      return;
    }
    
    if (!modelFormData.bodyType) {
      showNotification('Vui lòng chọn kiểu dáng', 'error');
      return;
    }

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

    // Validation các số liệu kỹ thuật >= 0
    const batteryCapacity = parseNumber(modelFormData.batteryCapacity);
    if (batteryCapacity !== null && batteryCapacity < 0) {
      showNotification('Dung lượng pin phải >= 0', 'error');
      return;
    }

    const range = parseNumber(modelFormData.range);
    if (range !== null && range < 0) {
      showNotification('Tầm hoạt động phải >= 0', 'error');
      return;
    }

    const powerHp = parseNumber(modelFormData.powerHp);
    if (powerHp !== null && powerHp < 0) {
      showNotification('Công suất (HP) phải >= 0', 'error');
      return;
    }

    const torqueNm = parseNumber(modelFormData.torqueNm);
    if (torqueNm !== null && torqueNm < 0) {
      showNotification('Mô-men xoắn (Nm) phải >= 0', 'error');
      return;
    }

    const acceleration = parseNumber(modelFormData.acceleration);
    if (acceleration !== null && acceleration < 0) {
      showNotification('Gia tốc phải >= 0', 'error');
      return;
    }

    const seatingCapacity = parseInteger(modelFormData.seatingCapacity);
    if (seatingCapacity !== null && seatingCapacity < 0) {
      showNotification('Số chỗ ngồi phải >= 0', 'error');
      return;
    }

    try {
      const createData = {
        modelName: modelFormData.modelName.trim(),
        modelYear: modelYear,
        bodyType: modelFormData.bodyType,
      };

      if (batteryCapacity !== null) createData.batteryCapacity = batteryCapacity;
      if (range !== null) createData.range = range;
      if (powerHp !== null) createData.powerHp = powerHp;
      if (torqueNm !== null) createData.torqueNm = torqueNm;
      if (acceleration !== null) createData.acceleration = acceleration;
      if (seatingCapacity !== null) createData.seatingCapacity = seatingCapacity;

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
        if (error.data.message) errorMessage = error.data.message;
        else if (error.data.error) errorMessage = error.data.error;
        else if (typeof error.data === 'string') errorMessage = error.data;
        else if (error.data.errors) {
          const errors = Array.isArray(error.data.errors)
            ? error.data.errors.join(', ')
            : Object.values(error.data.errors).join(', ');
          errorMessage = errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditModel = (model) => {
    setSelectedModel(model);
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
    if (!modelFormData.modelName?.trim()) {
      showNotification('Vui lòng nhập tên xe', 'error');
      return;
    }
    if (!modelFormData.modelYear || isNaN(parseInt(modelFormData.modelYear))) {
      showNotification('Vui lòng nhập năm sản xuất hợp lệ', 'error');
      return;
    }
    
    // Validation năm sản xuất
    const currentYear = new Date().getFullYear();
    const modelYear = parseInt(modelFormData.modelYear);
    if (modelYear < 2000 || modelYear > currentYear + 1) {
      showNotification(`Năm sản xuất phải từ 2000 đến ${currentYear + 1}`, 'error');
      return;
    }
    
    if (!modelFormData.bodyType) {
      showNotification('Vui lòng chọn kiểu dáng', 'error');
      return;
    }

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

    // Validation các số liệu kỹ thuật >= 0
    const batteryCapacity = parseNumber(modelFormData.batteryCapacity);
    if (batteryCapacity !== null && batteryCapacity < 0) {
      showNotification('Dung lượng pin phải >= 0', 'error');
      return;
    }

    const range = parseNumber(modelFormData.range);
    if (range !== null && range < 0) {
      showNotification('Tầm hoạt động phải >= 0', 'error');
      return;
    }

    const powerHp = parseNumber(modelFormData.powerHp);
    if (powerHp !== null && powerHp < 0) {
      showNotification('Công suất (HP) phải >= 0', 'error');
      return;
    }

    const torqueNm = parseNumber(modelFormData.torqueNm);
    if (torqueNm !== null && torqueNm < 0) {
      showNotification('Mô-men xoắn (Nm) phải >= 0', 'error');
      return;
    }

    const acceleration = parseNumber(modelFormData.acceleration);
    if (acceleration !== null && acceleration < 0) {
      showNotification('Gia tốc phải >= 0', 'error');
      return;
    }

    const seatingCapacity = parseInteger(modelFormData.seatingCapacity);
    if (seatingCapacity !== null && seatingCapacity < 0) {
      showNotification('Số chỗ ngồi phải >= 0', 'error');
      return;
    }

    try {
      const updateData = {
        id: selectedModel.modelId,
        modelName: modelFormData.modelName.trim(),
        modelYear: modelYear,
        bodyType: modelFormData.bodyType,
      };

      if (batteryCapacity !== null) updateData.batteryCapacity = batteryCapacity;
      if (range !== null) updateData.range = range;
      if (powerHp !== null) updateData.powerHp = powerHp;
      if (torqueNm !== null) updateData.torqueNm = torqueNm;
      if (acceleration !== null) updateData.acceleration = acceleration;
      if (seatingCapacity !== null) updateData.seatingCapacity = seatingCapacity;

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
      let errorMessage = 'Có lỗi xảy ra khi cập nhật xe';
      if (error?.data) {
        if (error.data.message) errorMessage = error.data.message;
        else if (error.data.error) errorMessage = error.data.error;
        else if (typeof error.data === 'string') errorMessage = error.data;
        else if (error.data.errors) {
          const errors = Array.isArray(error.data.errors)
            ? error.data.errors.join(', ')
            : Object.values(error.data.errors).join(', ');
          errorMessage = errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showNotification(errorMessage, 'error');
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
      }
    }
  };

  const handleCreateColor = async (e) => {
    e.preventDefault();
    if (!selectedModel) {
      showNotification('Vui lòng chọn mẫu xe trước', 'error');
      return;
    }
    
    // Validation
    if (!colorFormData.colorId) {
      showNotification('Vui lòng chọn màu sắc', 'error');
      return;
    }
    
    const price = parseFloat(colorFormData.price);
    if (!colorFormData.price || isNaN(price) || price <= 0) {
      showNotification('Giá phải là số lớn hơn 0', 'error');
      return;
    }
    
    try {
      // Bước 1: Tạo model color mới (API: /model-colors/create)
      const result = await createModelColor({
        modelId: selectedModel.modelId,
        colorId: parseInt(colorFormData.colorId),
        price: price,
      }).unwrap();
      
      // Bước 2: Nếu có file hình ảnh, upload sau khi tạo model color thành công
      // API: /model-colors/{modelId}/{colorId}/upload-model-color-image
      if (colorImageFile) {
        try {
          await uploadModelColorImage({
            modelId: selectedModel.modelId,
            colorId: parseInt(colorFormData.colorId),
            file: colorImageFile,
          }).unwrap();
          
          // Refetch để lấy dữ liệu mới bao gồm hình ảnh
          if (selectedModel?.modelId) {
            await refetchModelColors();
          }
          
          // Cả 2 API đều thành công
          setIsCreateColorModalOpen(false);
          setColorFormData({
            modelId: null,
            colorId: '',
            price: '',
          });
          setColorImageFile(null);
          showNotification('Thêm màu và upload hình ảnh thành công!', 'success');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          
          // Tạo màu thành công nhưng upload hình ảnh thất bại
          let uploadErrorMessage = 'Đã tạo màu nhưng có lỗi khi upload hình ảnh';
          
          if (uploadError?.status === 413 || uploadError?.data?.status === 413) {
            uploadErrorMessage = 'Đã tạo màu nhưng file hình ảnh quá lớn (tối đa 2MB)';
          } else if (uploadError?.data?.message) {
            uploadErrorMessage = `Đã tạo màu nhưng upload hình ảnh thất bại: ${uploadError.data.message}`;
          } else if (uploadError?.message) {
            uploadErrorMessage = `Đã tạo màu nhưng upload hình ảnh thất bại: ${uploadError.message}`;
          }
          
          setIsCreateColorModalOpen(false);
          setColorFormData({
            modelId: null,
            colorId: '',
            price: '',
          });
          setColorImageFile(null);
          showNotification(uploadErrorMessage, 'error');
        }
      } else {
        // Chỉ tạo màu, không có hình ảnh
        setIsCreateColorModalOpen(false);
        setColorFormData({
          modelId: null,
          colorId: '',
          price: '',
        });
        setColorImageFile(null);
        showNotification('Thêm màu cho mẫu xe thành công!', 'success');
      }
    } catch (error) {
      // Lỗi khi tạo model color
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Có lỗi xảy ra khi tạo color variant';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteColorClick = (id) => {
    setColorToDelete(id);
    setIsDeleteColorModalOpen(true);
  };

  const handleDeleteColor = async () => {
    if (!colorToDelete) return;
    
    try {
      await deleteModelColor(colorToDelete).unwrap();
      setIsDeleteColorModalOpen(false);
      setColorToDelete(null);
      showNotification('Xóa màu thành công!', 'success');
      
      // Refetch để cập nhật danh sách
      if (selectedModel?.modelId) {
        await refetchModelColors();
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Có lỗi xảy ra khi xóa màu';
      showNotification(errorMessage, 'error');
    }
  };

  const handleOpenUploadImageModal = (modelColor) => {
    setSelectedModelColor(modelColor);
    setUploadImageFile(null);
    setIsUploadImageModalOpen(true);
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!selectedModelColor || !uploadImageFile) {
      showNotification('Vui lòng chọn file hình ảnh', 'error');
      return;
    }

    try {
      await uploadModelColorImage({
        modelId: selectedModel.modelId,
        colorId: selectedModelColor.colorId,
        file: uploadImageFile,
      }).unwrap();
      
      // Refetch để lấy dữ liệu mới bao gồm hình ảnh
      if (selectedModel?.modelId) {
        await refetchModelColors();
      }
      
      setIsUploadImageModalOpen(false);
      setSelectedModelColor(null);
      setUploadImageFile(null);
      showNotification('Upload hình ảnh thành công!', 'success');
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi upload hình ảnh';
      
      // Xử lý các lỗi cụ thể
      if (error?.status === 413 || error?.data?.status === 413) {
        errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 2MB';
      } else if (error?.status === 'FETCH_ERROR' || error?.error === 'FETCH_ERROR') {
        errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      console.error('Upload image error:', error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
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
      }
    }
  };

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

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <EVMStaffLayout>
      <motion.div
        className="space-y-6 p-6 bg-gray-50/50 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Quản lý Sản phẩm
            </h1>
            <p className="text-gray-600 mt-1">Quản lý xe điện, biến thể màu và giao dịch kho</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
              <button
                onClick={() => setShowInventoryTransactions(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!showInventoryTransactions
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Box size={16} />
                  Quản lý Xe
                </div>
              </button>
              <button
                onClick={() => setShowInventoryTransactions(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${showInventoryTransactions
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={16} />
                  Giao dịch Kho
                </div>
              </button>
            </div>

            {!showInventoryTransactions && (
              <Button
                onClick={() => setIsCreateModelModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
              >
                <Plus size={20} className="mr-2" />
                Thêm xe mới
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {!showInventoryTransactions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Tổng số xe</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{models.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Box size={24} className="text-gray-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Biến thể màu</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{allModelColors.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Layers size={24} className="text-gray-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Màu sắc</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{colors.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-gray-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Inventory Transactions Section */}
        <AnimatePresence mode="wait">
          {showInventoryTransactions ? (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters for Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <SearchBar
                      placeholder="Tìm kiếm theo mã transaction, tên mẫu xe..."
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoadingTransactions ? (
                  <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                    <Package size={48} className="text-gray-300 mb-4" />
                    <p>Không có dữ liệu giao dịch</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>MÃ TRANSACTION</Table.Head>
                          <Table.Head>MẪU XE</Table.Head>
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
                        {filteredTransactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.inventoryId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <Table.Cell className="font-mono font-medium text-blue-600">
                              #{transaction.inventoryId}
                            </Table.Cell>
                            <Table.Cell>{transaction.modelName || 'N/A'}</Table.Cell>
                            <Table.Cell>{transaction.colorName || 'N/A'}</Table.Cell>
                            <Table.Cell>{transaction.storeName || 'N/A'}</Table.Cell>
                            <Table.Cell>{transaction.importQuantity || 0}</Table.Cell>
                            <Table.Cell className="font-medium text-gray-900">
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
                                      className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                      Chấp nhận
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransaction(transaction.inventoryId)}
                                      className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                      Từ chối
                                    </button>
                                  </>
                                )}
                                {transaction.status === 'ACCEPTED' && (
                                  <button
                                    onClick={() => handleStartShipping(transaction.inventoryId)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                                  >
                                    <Truck size={12} />
                                    Vận chuyển
                                  </button>
                                )}
                                {transaction.status === 'SHIPPING' && (
                                  <button
                                    onClick={() => handleConfirmDelivery(transaction.inventoryId)}
                                    className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                                  >
                                    Xác nhận giao
                                  </button>
                                )}
                              </div>
                            </Table.Cell>
                          </motion.tr>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="models"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search for Models */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <SearchBar
                      placeholder="Tìm kiếm theo tên xe, mã..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model, index) => {
                  const basePrice = modelPriceMap.get(model.modelId) || 0;
                  const colorCount = allModelColors.filter((mc) => mc.modelId === model.modelId).length;
                  const modelImages = modelImagesMap.get(model.modelId) || [];
                  const currentIdx = currentImageIndex[model.modelId] || 0;
                  const currentImage = modelImages[currentIdx];

                  return (
                    <motion.div
                      key={model.modelId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      onClick={() => setSelectedModel(model)}
                    >
                      {/* Card Header with Image Carousel */}
                      <div className="h-48 relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                        {modelImages.length > 0 ? (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={`${model.modelId}-${currentIdx}`}
                                src={currentImage.imageUrl}
                                alt={`${model.modelName} - ${currentImage.colorName}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </AnimatePresence>
                            {/* Image indicators */}
                            {modelImages.length > 1 && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                                {modelImages.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      idx === currentIdx
                                        ? 'w-6 bg-white'
                                        : 'w-1.5 bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            {/* Model ID overlay */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                              <p className="text-gray-500 text-xs font-medium">Mẫu xe</p>
                              <p className="text-gray-900 text-sm font-bold">ELEC-{model.modelId}</p>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/30 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-200/30 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative z-10 flex items-center justify-between w-full px-6">
                              <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                                <Zap size={32} className="text-gray-700" />
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs font-medium">Mẫu xe</p>
                                <p className="text-gray-900 text-lg font-bold">ELEC-{model.modelId}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{model.modelName}</h3>
                        <p className="text-sm text-gray-500 mb-4">Năm {model.modelYear} • {model.bodyType}</p>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {model.batteryCapacity && (
                            <div className="flex items-center gap-2 text-sm">
                              <Battery size={16} className="text-gray-500" />
                              <span className="text-gray-600">{model.batteryCapacity} kWh</span>
                            </div>
                          )}
                          {model.range && (
                            <div className="flex items-center gap-2 text-sm">
                              <Gauge size={16} className="text-gray-500" />
                              <span className="text-gray-600">{model.range} km</span>
                            </div>
                          )}
                          {model.powerHp && (
                            <div className="flex items-center gap-2 text-sm">
                              <Zap size={16} className="text-gray-500" />
                              <span className="text-gray-600">{model.powerHp} HP</span>
                            </div>
                          )}
                          {model.seatingCapacity && (
                            <div className="flex items-center gap-2 text-sm">
                              <Package size={16} className="text-gray-500" />
                              <span className="text-gray-600">{model.seatingCapacity} chỗ</span>
                            </div>
                          )}
                        </div>

                        {/* Price and Colors */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500">Giá từ</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrencyVND(basePrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Màu sắc</p>
                            <p className="text-lg font-bold text-gray-900">{colorCount} màu</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditModel(model);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Edit size={16} />
                            Sửa
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModel(model.modelId);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredModels.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Box size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Không tìm thấy xe nào</p>
                  <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Model Details Modal */}
        <Modal
          isOpen={selectedModel !== null && !isEditModelModalOpen}
          onClose={() => setSelectedModel(null)}
          title={`Chi tiết: ${selectedModel?.modelName || ''}`}
          size="lg"
        >
          {selectedModel && (
            <div className="space-y-6">
              {/* Model Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã xe</label>
                  <p className="text-base font-semibold text-gray-900">ELEC-{selectedModel.modelId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Năm sản xuất</label>
                  <p className="text-base text-gray-900">{selectedModel.modelYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kiểu dáng</label>
                  <p className="text-base text-gray-900">{selectedModel.bodyType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedModel.status)}</div>
                </div>
              </div>

              {/* Color Variants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Biến thể màu ({modelColors.length})</h3>
              <Button
                size="sm"
                onClick={() => {
                  setIsCreateColorModalOpen(true);
                  setColorImageFile(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={16} className="mr-1" />
                Thêm màu
              </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {modelColors.map((mc) => {
                    const color = colors.find((c) => c.colorId === mc.colorId);
                    return (
                      <div
                        key={mc.modelColorId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {/* Hiển thị hình ảnh nếu có - kiểm tra nhiều field có thể có */}
                          {(mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile) ? (
                            <img
                              src={mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile}
                              alt={color?.colorName || 'Color'}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div
                            className={`rounded-lg border-2 border-white shadow-sm ${(mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile) ? 'hidden' : 'block'}`}
                            style={{ 
                              width: '64px', 
                              height: '64px',
                              backgroundColor: color?.hexCode || '#ccc',
                              display: (mc.imageUrl || mc.image || mc.imagePath || mc.imageFileUrl || mc.imageFile) ? 'none' : 'block'
                            }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900">{color?.colorName || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{formatCurrencyVND(mc.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenUploadImageModal(mc)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Upload hình ảnh"
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteColorClick(mc.modelColorId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa màu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Model Modal */}
        <Modal
          isOpen={isCreateModelModalOpen}
          onClose={() => setIsCreateModelModalOpen(false)}
          title="Thêm xe mới"
          size="lg"
        >
          <form onSubmit={handleCreateModel} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tên xe *"
                value={modelFormData.modelName}
                onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
                placeholder="VinFast VF8"
                required
              />
              <Input
                label="Năm sản xuất *"
                type="number"
                value={modelFormData.modelYear}
                onChange={(e) => setModelFormData({ ...modelFormData, modelYear: e.target.value })}
                placeholder="2024"
                required
              />
              <Dropdown
                label="Kiểu dáng *"
                options={[
                  { value: '', label: 'Chọn kiểu dáng' },
                  ...bodyTypes.map((bt) => ({ value: bt, label: bt })),
                ]}
                value={modelFormData.bodyType}
                onChange={(value) => setModelFormData({ ...modelFormData, bodyType: value })}
                required
              />
              <Input
                label="Dung lượng pin (kWh)"
                type="number"
                step="0.1"
                value={modelFormData.batteryCapacity}
                onChange={(e) => setModelFormData({ ...modelFormData, batteryCapacity: e.target.value })}
                placeholder="87.7"
              />
              <Input
                label="Phạm vi (km)"
                type="number"
                step="0.1"
                value={modelFormData.range}
                onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })}
                placeholder="420"
              />
              <Input
                label="Công suất (HP)"
                type="number"
                step="0.1"
                value={modelFormData.powerHp}
                onChange={(e) => setModelFormData({ ...modelFormData, powerHp: e.target.value })}
                placeholder="402"
              />
              <Input
                label="Mô-men xoắn (Nm)"
                type="number"
                step="0.1"
                value={modelFormData.torqueNm}
                onChange={(e) => setModelFormData({ ...modelFormData, torqueNm: e.target.value })}
                placeholder="640"
              />
              <Input
                label="Tăng tốc 0-100km/h (s)"
                type="number"
                step="0.1"
                value={modelFormData.acceleration}
                onChange={(e) => setModelFormData({ ...modelFormData, acceleration: e.target.value })}
                placeholder="5.5"
              />
              <Input
                label="Số chỗ ngồi"
                type="number"
                value={modelFormData.seatingCapacity}
                onChange={(e) => setModelFormData({ ...modelFormData, seatingCapacity: e.target.value })}
                placeholder="5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModelModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isCreatingModel}>
                {isCreatingModel ? 'Đang tạo...' : 'Tạo xe'}
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
          }}
          title="Chỉnh sửa xe"
          size="lg"
        >
          <form onSubmit={handleUpdateModel} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tên xe *"
                value={modelFormData.modelName}
                onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
                required
              />
              <Input
                label="Năm sản xuất *"
                type="number"
                value={modelFormData.modelYear}
                onChange={(e) => setModelFormData({ ...modelFormData, modelYear: e.target.value })}
                required
              />
              <Dropdown
                label="Kiểu dáng *"
                options={[
                  { value: '', label: 'Chọn kiểu dáng' },
                  ...bodyTypes.map((bt) => ({ value: bt, label: bt })),
                ]}
                value={modelFormData.bodyType}
                onChange={(value) => setModelFormData({ ...modelFormData, bodyType: value })}
                required
              />
              <Input
                label="Dung lượng pin (kWh)"
                type="number"
                step="0.1"
                value={modelFormData.batteryCapacity}
                onChange={(e) => setModelFormData({ ...modelFormData, batteryCapacity: e.target.value })}
              />
              <Input
                label="Phạm vi (km)"
                type="number"
                step="0.1"
                value={modelFormData.range}
                onChange={(e) => setModelFormData({ ...modelFormData, range: e.target.value })}
              />
              <Input
                label="Công suất (HP)"
                type="number"
                step="0.1"
                value={modelFormData.powerHp}
                onChange={(e) => setModelFormData({ ...modelFormData, powerHp: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModelModalOpen(false);
                  setSelectedModel(null);
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdatingModel}>
                {isUpdatingModel ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Create Color Modal */}
        <Modal
          isOpen={isCreateColorModalOpen}
          onClose={() => {
            setIsCreateColorModalOpen(false);
            setColorImageFile(null);
          }}
          title="Thêm biến thể màu"
        >
          <form onSubmit={handleCreateColor} className="space-y-4">
            <Dropdown
              label="Màu sắc *"
              options={[
                { value: '', label: 'Chọn màu' },
                ...colors.map((c) => ({ value: c.colorId.toString(), label: c.colorName })),
              ]}
              value={colorFormData.colorId}
              onChange={(value) => setColorFormData({ ...colorFormData, colorId: value })}
              required
            />
            <Input
              label="Giá *"
              type="number"
              value={colorFormData.price}
              onChange={(e) => setColorFormData({ ...colorFormData, price: e.target.value })}
              placeholder="50000"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh xe có màu này (tùy chọn)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (max 2MB để tránh lỗi 413)
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    if (file.size > maxSize) {
                      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                      showNotification(`File quá lớn (${fileSizeMB}MB). Vui lòng chọn file nhỏ hơn 2MB`, 'error');
                      e.target.value = '';
                      return;
                    }
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      showNotification('Vui lòng chọn file hình ảnh', 'error');
                      e.target.value = '';
                      return;
                    }
                    setColorImageFile(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">Kích thước tối đa: 2MB</p>
              {colorImageFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{colorImageFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setColorImageFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateColorModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isCreatingColor || isUploadingImage}>
                {isCreatingColor || isUploadingImage ? 'Đang xử lý...' : 'Thêm màu'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Image Modal */}
        <Modal
          isOpen={isUploadImageModalOpen}
          onClose={() => {
            setIsUploadImageModalOpen(false);
            setSelectedModelColor(null);
            setUploadImageFile(null);
          }}
          title="Upload hình ảnh màu xe"
        >
          <form onSubmit={handleUploadImage} className="space-y-4">
            {selectedModelColor && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Màu:</span> {colors.find((c) => c.colorId === selectedModelColor.colorId)?.colorName || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Mẫu xe:</span> {selectedModel?.modelName || 'N/A'}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn hình ảnh xe có màu này *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (max 2MB để tránh lỗi 413)
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    if (file.size > maxSize) {
                      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                      showNotification(`File quá lớn (${fileSizeMB}MB). Vui lòng chọn file nhỏ hơn 2MB`, 'error');
                      e.target.value = '';
                      return;
                    }
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      showNotification('Vui lòng chọn file hình ảnh', 'error');
                      e.target.value = '';
                      return;
                    }
                    setUploadImageFile(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Kích thước tối đa: 2MB</p>
              {uploadImageFile && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={URL.createObjectURL(uploadImageFile)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">{uploadImageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadImageFile(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsUploadImageModalOpen(false);
                  setSelectedModelColor(null);
                  setUploadImageFile(null);
                }}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isUploadingImage || !uploadImageFile}
              >
                {isUploadingImage ? 'Đang upload...' : 'Upload hình ảnh'}
              </Button>
            </div>
          </form>
        </Modal>
      </motion.div>
    </EVMStaffLayout>
  );
};

export default ProductManagementPage;
