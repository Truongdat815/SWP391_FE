import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Eye, Edit, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionTypesQuery,
} from '../../../api/dealerManager/promotionApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const PromotionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [formData, setFormData] = useState({
    promotionName: '',
    description: '',
    startDate: '',
    endDate: '',
    promotionType: '',
    amount: '',
    selectedModelIds: [], // Array of model IDs, empty = all models
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef(null);

  // Close model dropdown when clicking outside


  const { data: promotionsData, isLoading, error } = useGetAllPromotionsQuery();
  const { data: typesData } = useGetPromotionTypesQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  // Handle response format: { code: 200, data: [...] }
  // Debug: check actual structure
  console.log('🔍 PromotionPage - promotionsData:', promotionsData);
  console.log('🔍 PromotionPage - promotionsData?.data:', promotionsData?.data);
  console.log('🔍 PromotionPage - promotionsData?.data?.data:', promotionsData?.data?.data);

  // Try multiple parsing approaches
  let promotions = [];
  if (promotionsData) {
    if (Array.isArray(promotionsData?.data?.data)) {
      promotions = promotionsData.data.data;
      console.log('✅ Using nested structure (data.data), found', promotions.length, 'promotions');
    } else if (Array.isArray(promotionsData?.data)) {
      promotions = promotionsData.data;
      console.log('✅ Using direct structure (data), found', promotions.length, 'promotions');
    } else if (Array.isArray(promotionsData)) {
      promotions = promotionsData;
      console.log('✅ Using direct access, found', promotions.length, 'promotions');
    } else {
      console.warn('⚠️ Could not parse promotions data. Structure:', promotionsData);
    }
  }

  const types = typesData?.data?.data || [];
  const models = modelsData?.data || [];

  console.log('🔍 Final promotions array:', promotions);
  console.log('🔍 Promotions count:', promotions.length);

  // Helper function to check if promotion is actually active based on dates
  const isPromotionActive = (promo) => {
    if (!promo.startDate || !promo.endDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(promo.startDate);
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const end = new Date(promo.endDate);
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
    return today >= startDateOnly && today <= endDateOnly;
  };

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    if (!Array.isArray(promotions)) {
      return [];
    }

    const filtered = promotions.filter((promo) => {
      const matchesSearch =
        !searchTerm || // If no search term, match all
        promo.promotionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Tính trạng thái thực tế dựa trên ngày tháng và active field
      const actuallyActive = isPromotionActive(promo) && (promo.active !== false);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && actuallyActive) ||
        (statusFilter === 'inactive' && !actuallyActive);

      // Filter by type - only PERCENTAGE and FIXED_AMOUNT
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'PERCENTAGE' && promo.promotionType === 'PERCENTAGE') ||
        (typeFilter === 'FIXED_AMOUNT' && promo.promotionType === 'FIXED_AMOUNT');

      const matches = matchesSearch && matchesStatus && matchesType;

      return matches;
    });

    return filtered;
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (promo) => {
    const { startDate, endDate, active, manuallyDisabled } = promo;
    if (!startDate || !endDate) {
      return <Badge variant="default">N/A</Badge>;
    }

    const now = new Date();
    // Chỉ lấy phần ngày, bỏ qua giờ để so sánh chính xác
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate);
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    const end = new Date(endDate);
    // Set endDate thành cuối ngày (23:59:59) để đảm bảo cả ngày cuối cùng vẫn còn hiệu lực
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

    // Kiểm tra manuallyDisabled trước
    if (manuallyDisabled || active === false) {
      return <Badge variant="default">Đã vô hiệu hóa</Badge>;
    }

    // Kiểm tra ngày tháng
    if (today < startDateOnly) {
      return <Badge variant="warning">Sắp diễn ra</Badge>;
    }
    if (today >= startDateOnly && today <= endDateOnly) {
      return <Badge variant="success">Đang hoạt động</Badge>;
    }
    // Nếu đã qua ngày kết thúc
    return <Badge variant="default">Đã kết thúc</Badge>;
  };

  const formatDiscount = (promo) => {
    if (promo.promotionType === 'PERCENTAGE') {
      return `Giảm ${promo.amount}%`;
    } else if (promo.promotionType === 'FIXED_AMOUNT') {
      return `Giảm ${new Intl.NumberFormat('vi-VN').format(promo.amount)} VNĐ`;
    }
    return promo.description || 'N/A';
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

  // Format date for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get minimum end date (startDate + 1 day) in YYYY-MM-DD format
  const getMinEndDate = (startDate) => {
    if (!startDate) return getTodayDate();
    try {
      const start = new Date(startDate);
      start.setDate(start.getDate() + 1); // Thêm 1 ngày
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return getTodayDate();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validation - Tên chương trình
    if (!formData.promotionName || formData.promotionName.trim() === '') {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập tên chương trình khuyến mãi' });
      return;
    }

    // Validation - Ngày
    if (!formData.startDate) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn ngày bắt đầu' });
      return;
    }

    if (!formData.endDate) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn ngày kết thúc' });
      return;
    }

    // Validation - Loại khuyến mãi
    if (!formData.promotionType) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn loại khuyến mãi' });
      return;
    }

    // Validation - Giá trị khuyến mãi
    if (!formData.amount || formData.amount.toString().trim() === '') {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập giá trị khuyến mãi' });
      return;
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorModal({ isOpen: true, message: 'Giá trị khuyến mãi phải lớn hơn 0' });
      return;
    }

    if (formData.promotionType === 'PERCENTAGE' && amountValue > 100) {
      setErrorModal({ isOpen: true, message: 'Phần trăm khuyến mãi không được vượt quá 100%' });
      return;
    }

    // Validation ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chỉ lấy phần ngày, bỏ qua giờ

    const startDate = new Date(formData.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(formData.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Ngày bắt đầu phải >= ngày hiện tại (không được là quá khứ)
    if (startDate < today) {
      setErrorModal({ isOpen: true, message: 'Ngày bắt đầu phải từ hôm nay trở đi, không được chọn ngày quá khứ' });
      return;
    }

    // Ngày kết thúc phải > ngày bắt đầu ít nhất 1 ngày
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const daysDifference = (endDate - startDate) / oneDayInMs;

    if (endDate <= startDate || daysDifference < 1) {
      setErrorModal({ isOpen: true, message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu ít nhất 1 ngày' });
      return;
    }

    try {
      // Format dates to include time component for LocalDateTime (ISO format)
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        // dateString is in format YYYY-MM-DD from input type="date"
        // Add time component: start date at 00:00:00
        return dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
      };

      const formatEndDateForBackend = (dateString) => {
        if (!dateString) return null;
        // End date should be at end of day (23:59:59)
        return dateString.includes('T') ? dateString : `${dateString}T23:59:59`;
      };

      // Generate description if not provided by user
      const description = formData.description?.trim() || (
        formData.promotionType === 'PERCENTAGE'
          ? `Giảm ${amountValue}%`
          : `Giảm ${new Intl.NumberFormat('vi-VN').format(amountValue)} VNĐ`
      );

      // Get selected model info if any
      const selectedModelIds = formData.selectedModelIds || [];
      const selectedModelId = selectedModelIds.length > 0 ? selectedModelIds[0] : null;
      const selectedModel = selectedModelId ? models.find(m => m.modelId === selectedModelId) : null;

      // Prepare request body - only send fields required by API
      // Do NOT send: promotionId, storeId, storeName, createdAt, active, manuallyDisabled
      const requestBody = {
        promotionName: formData.promotionName.trim(),
        description: description,
        promotionType: formData.promotionType,
        amount: amountValue,
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatEndDateForBackend(formData.endDate),
      };

      // Add model info if a specific model is selected
      if (selectedModelId && selectedModel) {
        requestBody.modelId = selectedModelId;
        requestBody.modelName = selectedModel.modelName || '';
      } else if (selectedModelId) {
        // If model ID is provided but model not found in list, still send the ID
        requestBody.modelId = selectedModelId;
      }
      // If no model selected, don't send modelId/modelName (applies to all models)

      if (import.meta.env.DEV) {
        console.log('Submitting promotion data:', requestBody);
      }

      // Create promotion - if multiple models selected, create one for each
      if (selectedModelIds.length > 1) {
        // Create promotion for each selected model
        const promises = selectedModelIds.map(modelId => {
          const model = models.find(m => m.modelId === modelId);
          const bodyForModel = {
            ...requestBody,
            modelId: modelId,
            modelName: model?.modelName || '',
          };
          return createPromotion(bodyForModel).unwrap();
        });

        await Promise.all(promises);
        setSuccessModal({ isOpen: true, message: `Đã tạo thành công ${selectedModelIds.length} khuyến mãi!` });
      } else if (selectedModelIds.length === 0) {
        // If "all models" selected, create promotion for each model
        const allModelIds = models.map(m => m.modelId);
        const promises = allModelIds.map(modelId => {
          const model = models.find(m => m.modelId === modelId);
          const bodyForModel = {
            ...requestBody,
            modelId: modelId,
            modelName: model?.modelName || '',
          };
          return createPromotion(bodyForModel).unwrap();
        });

        await Promise.all(promises);
        setSuccessModal({ isOpen: true, message: `Đã tạo thành công ${allModelIds.length} khuyến mãi cho tất cả các model!` });
      } else {
        // Single promotion (for one specific model)
        await createPromotion(requestBody).unwrap();
        setSuccessModal({ isOpen: true, message: 'Tạo khuyến mãi thành công!' });
      }

      setIsCreateModalOpen(false);
      setFormData({
        promotionName: '',
        description: '',
        startDate: '',
        endDate: '',
        promotionType: '',
        amount: '',
        selectedModelIds: [],
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      let errorMessage = 'Có lỗi xảy ra khi tạo khuyến mãi';

      if (error?.data) {
        errorMessage = error.data.message ||
          error.data.error ||
          error.data.errorMessage ||
          error.data.error?.message ||
          errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Hiển thị chi tiết lỗi trong development
      if (import.meta.env.DEV) {
        console.error('Full error object:', error);
        if (error?.data) {
          console.error('Error data:', error.data);
        }
      }

      setErrorModal({ isOpen: true, message: errorMessage });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedPromotion) {
      setErrorModal({ isOpen: true, message: 'Không tìm thấy khuyến mãi để cập nhật' });
      return;
    }

    // Validation - same as create
    if (!formData.promotionName || formData.promotionName.trim() === '') {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập tên chương trình khuyến mãi' });
      return;
    }

    if (!formData.startDate) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn ngày bắt đầu' });
      return;
    }

    if (!formData.endDate) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn ngày kết thúc' });
      return;
    }

    if (!formData.promotionType) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn loại khuyến mãi' });
      return;
    }

    if (!formData.amount || formData.amount.toString().trim() === '') {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập giá trị khuyến mãi' });
      return;
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorModal({ isOpen: true, message: 'Giá trị khuyến mãi phải lớn hơn 0' });
      return;
    }

    if (formData.promotionType === 'PERCENTAGE' && amountValue > 100) {
      setErrorModal({ isOpen: true, message: 'Phần trăm khuyến mãi không được vượt quá 100%' });
      return;
    }

    // Validation ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(formData.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(formData.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Ngày bắt đầu không được trong quá khứ
    if (startDate < today) {
      setErrorModal({ isOpen: true, message: 'Ngày bắt đầu không được trong quá khứ' });
      return;
    }

    // Ngày kết thúc phải sau ngày bắt đầu
    if (endDate <= startDate) {
      setErrorModal({ isOpen: true, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      return;
    }

    try {
      // Format dates
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        return dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
      };

      const formatEndDateForBackend = (dateString) => {
        if (!dateString) return null;
        return dateString.includes('T') ? dateString : `${dateString}T23:59:59`;
      };

      // Generate description if not provided
      const description = formData.description?.trim() || (
        formData.promotionType === 'PERCENTAGE'
          ? `Giảm ${amountValue}%`
          : `Giảm ${new Intl.NumberFormat('vi-VN').format(amountValue)} VNĐ`
      );

      const selectedModelIds = formData.selectedModelIds || [];

      // Prepare request body
      const requestBody = {
        promotionName: formData.promotionName.trim(),
        description: description,
        promotionType: formData.promotionType,
        amount: amountValue,
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatEndDateForBackend(formData.endDate),
      };

      // If "all models" selected (empty array), create promotion for each model
      if (selectedModelIds.length === 0) {
        const allModelIds = models.map(m => m.modelId);
        // First, update the current promotion with full request body
        const fullRequestBodyForCurrent = {
          promotionId: selectedPromotion.promotionId,
          promotionName: formData.promotionName.trim(),
          description: description,
          promotionType: formData.promotionType,
          amount: amountValue,
          startDate: formatDateForBackend(formData.startDate),
          endDate: formatEndDateForBackend(formData.endDate),
          modelId: selectedPromotion.modelId, // Keep original modelId for this one
          modelName: selectedPromotion.modelName || '',
          storeId: selectedPromotion.storeId || 0,
          storeName: selectedPromotion.storeName || '',
          createdAt: selectedPromotion.createdAt || new Date().toISOString(),
          active: selectedPromotion.active !== false,
          manuallyDisabled: selectedPromotion.manuallyDisabled || false,
        };

        await updatePromotion({
          promotionId: selectedPromotion.promotionId,
          ...fullRequestBodyForCurrent,
        }).unwrap();

        // Then create new promotions for other models
        const otherModelIds = allModelIds.filter(id => id !== selectedPromotion.modelId);
        if (otherModelIds.length > 0) {
          const promises = otherModelIds.map(modelId => {
            const model = models.find(m => m.modelId === modelId);
            const bodyForModel = {
              ...requestBody,
              modelId: modelId,
              modelName: model?.modelName || '',
            };
            return createPromotion(bodyForModel).unwrap();
          });

          await Promise.all(promises);
          setSuccessModal({ isOpen: true, message: `Đã cập nhật khuyến mãi và tạo ${otherModelIds.length} khuyến mãi mới cho các model còn lại!` });
        } else {
          setSuccessModal({ isOpen: true, message: 'Đã cập nhật khuyến mãi thành công!' });
        }
      } else if (selectedModelIds.length > 1) {
        // Multiple models selected - update current and create for others
        const currentModelId = selectedPromotion.modelId;
        const otherModelIds = selectedModelIds.filter(id => id !== currentModelId);

        // Update current promotion with full request body
        const currentModel = models.find(m => m.modelId === currentModelId);
        const fullRequestBodyForCurrent = {
          promotionId: selectedPromotion.promotionId,
          promotionName: formData.promotionName.trim(),
          description: description,
          promotionType: formData.promotionType,
          amount: amountValue,
          startDate: formatDateForBackend(formData.startDate),
          endDate: formatEndDateForBackend(formData.endDate),
          modelId: currentModelId,
          modelName: currentModel?.modelName || '',
          storeId: selectedPromotion.storeId || 0,
          storeName: selectedPromotion.storeName || '',
          createdAt: selectedPromotion.createdAt || new Date().toISOString(),
          active: selectedPromotion.active !== false,
          manuallyDisabled: selectedPromotion.manuallyDisabled || false,
        };

        await updatePromotion({
          promotionId: selectedPromotion.promotionId,
          ...fullRequestBodyForCurrent,
        }).unwrap();

        // Create for other selected models
        if (otherModelIds.length > 0) {
          const promises = otherModelIds.map(modelId => {
            const model = models.find(m => m.modelId === modelId);
            const bodyForModel = {
              ...requestBody,
              modelId: modelId,
              modelName: model?.modelName || '',
            };
            return createPromotion(bodyForModel).unwrap();
          });

          await Promise.all(promises);
          setSuccessModal({ isOpen: true, message: `Đã cập nhật khuyến mãi và tạo ${otherModelIds.length} khuyến mãi mới!` });
        } else {
          setSuccessModal({ isOpen: true, message: 'Đã cập nhật khuyến mãi thành công!' });
        }
      } else {
        // Single model selected - just update
        const selectedModelId = selectedModelIds[0];
        const selectedModel = models.find(m => m.modelId === selectedModelId);

        // Prepare full request body according to API format
        const fullRequestBody = {
          promotionId: selectedPromotion.promotionId,
          promotionName: formData.promotionName.trim(),
          description: description,
          promotionType: formData.promotionType,
          amount: amountValue,
          startDate: formatDateForBackend(formData.startDate),
          endDate: formatEndDateForBackend(formData.endDate),
          modelId: selectedModelId,
          modelName: selectedModel?.modelName || '',
          storeId: selectedPromotion.storeId || 0,
          storeName: selectedPromotion.storeName || '',
          createdAt: selectedPromotion.createdAt || new Date().toISOString(),
          active: selectedPromotion.active !== false,
          manuallyDisabled: selectedPromotion.manuallyDisabled || false,
        };

        await updatePromotion({
          promotionId: selectedPromotion.promotionId,
          ...fullRequestBody,
        }).unwrap();

        setSuccessModal({ isOpen: true, message: 'Đã cập nhật khuyến mãi thành công!' });
      }

      setIsEditModalOpen(false);
      setSelectedPromotion(null);
      setFormData({
        promotionName: '',
        description: '',
        startDate: '',
        endDate: '',
        promotionType: '',
        amount: '',
        selectedModelIds: [],
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      let errorMessage = 'Có lỗi xảy ra khi cập nhật khuyến mãi';

      if (error?.data) {
        errorMessage = error.data.message ||
          error.data.error ||
          error.data.errorMessage ||
          error.data.error?.message ||
          errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrorModal({ isOpen: true, message: errorMessage });
    }
  };

  const handleViewDetails = (promo) => {
    setSelectedPromotion(promo);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (promo) => {
    setSelectedPromotion(promo);
    // Load promotion data into form
    setFormData({
      promotionName: promo.promotionName || '',
      description: promo.description || '',
      startDate: formatDateForInput(promo.startDate),
      endDate: formatDateForInput(promo.endDate),
      promotionType: promo.promotionType || '',
      amount: promo.amount?.toString() || '',
      selectedModelIds: promo.modelId ? [promo.modelId] : [], // If has modelId, select it; otherwise empty = all models
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (promo) => {
    setPromotionToDelete(promo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) {
      return;
    }

    try {
      await deletePromotion(promotionToDelete.promotionId).unwrap();
      setSuccessModal({ isOpen: true, message: 'Đã xóa khuyến mãi thành công!' });
      setIsDeleteModalOpen(false);
      setPromotionToDelete(null);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      let errorMessage = 'Có lỗi xảy ra khi xóa khuyến mãi';

      if (error?.data) {
        errorMessage = error.data.message ||
          error.data.error ||
          error.data.errorMessage ||
          error.data.error?.message ||
          errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrorModal({ isOpen: true, message: errorMessage });
      setIsDeleteModalOpen(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;

  if (isUnauthorized) {
    return (
      <DealerManagerLayout>
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
      </DealerManagerLayout>
    );
  }

  if (error) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="space-y-6 p-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chương trình Khuyến mãi</h1>
            <p className="text-gray-600 mt-1">
              Xem, tạo và quản lý các chương trình khuyến mãi tại đại lý.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Tạo Khuyến mãi Mới
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Lọc theo trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Đã kết thúc' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Loại khuyến mãi' },
                { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedPromotions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto overflow-y-visible">
                <Table className="w-full table-auto">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Tên chương trình</Table.Head>
                      <Table.Head>Thời gian áp dụng</Table.Head>
                      <Table.Head>Mức giảm giá/Ưu đãi</Table.Head>
                      <Table.Head>Trạng thái</Table.Head>
                      <Table.Head className="text-center">Hành động</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedPromotions.map((promo) => (
                      <Table.Row key={promo.promotionId}>
                        <Table.Cell className="font-medium">
                          {promo.promotionName || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                        </Table.Cell>
                        <Table.Cell>{formatDiscount(promo)}</Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(promo)}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(promo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(promo)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Sửa khuyến mãi"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(promo)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa khuyến mãi"
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

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPromotions.length)} của{' '}
                  {filteredPromotions.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Khuyến mãi Mới"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên chương trình"
            value={formData.promotionName}
            onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: '' })}
              min={getTodayDate()}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={getMinEndDate(formData.startDate)}
              required
            />
          </div>
          <Input
            label="Mô tả (tùy chọn)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả khuyến mãi..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại khuyến mãi</label>
            <Dropdown
              options={
                Array.isArray(types) && types.length > 0
                  ? types.map(type => ({
                    value: type,
                    label: type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'
                  }))
                  : [
                    { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
                  ]
              }
              value={formData.promotionType}
              onChange={(value) => setFormData({ ...formData, promotionType: value })}
              placeholder="Chọn loại khuyến mãi"
            />
          </div>
          <Input
            label="Giá trị khuyến mãi"
            type="number"
            min={formData.promotionType === 'PERCENTAGE' ? '0' : '0'}
            max={formData.promotionType === 'PERCENTAGE' ? '100' : undefined}
            step={formData.promotionType === 'PERCENTAGE' ? '0.01' : '1'}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            placeholder={formData.promotionType === 'PERCENTAGE' ? 'Nhập % (0-100)' : 'Nhập số tiền'}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Áp dụng cho model (tùy chọn)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {formData.selectedModelIds.length === 0
                    ? 'Tất cả các model'
                    : formData.selectedModelIds.length === 1
                      ? models.find(m => m.modelId === formData.selectedModelIds[0])?.modelName || `Model ${formData.selectedModelIds[0]}`
                      : `Đã chọn ${formData.selectedModelIds.length} model`}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${isModelDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </button>

              {isModelDropdownOpen && (
                <div className="w-full mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedModelIds.length === 0}
                        onChange={() => {
                          setFormData({ ...formData, selectedModelIds: [] });
                          setIsModelDropdownOpen(false);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-900">Tất cả các model</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {(Array.isArray(models) ? models : []).map((model) => {
                        const isSelected = formData.selectedModelIds.includes(model.modelId);
                        return (
                          <label
                            key={model.modelId}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newSelected = isSelected
                                  ? formData.selectedModelIds.filter(id => id !== model.modelId)
                                  : [...formData.selectedModelIds, model.modelId];
                                setFormData({ ...formData, selectedModelIds: newSelected });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-900">
                              {model.modelName || `Model ${model.modelId}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chọn "Tất cả các model" để tạo 1 khuyến mãi áp dụng cho tất cả các model. Chọn một hoặc nhiều model cụ thể để tạo khuyến mãi cho các model đó.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
          setFormData({
            promotionName: '',
            description: '',
            startDate: '',
            endDate: '',
            promotionType: '',
            amount: '',
            selectedModelIds: [],
          });
        }}
        title="Sửa Khuyến mãi"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên chương trình"
            value={formData.promotionName}
            onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: '' })}
              min={getTodayDate()}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={getMinEndDate(formData.startDate)}
              required
            />
          </div>
          <Input
            label="Mô tả (tùy chọn)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả khuyến mãi..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại khuyến mãi</label>
            <Dropdown
              options={
                Array.isArray(types) && types.length > 0
                  ? types.map(type => ({
                    value: type,
                    label: type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'
                  }))
                  : [
                    { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
                  ]
              }
              value={formData.promotionType}
              onChange={(value) => setFormData({ ...formData, promotionType: value })}
              placeholder="Chọn loại khuyến mãi"
            />
          </div>
          <Input
            label="Giá trị khuyến mãi"
            type="number"
            min={formData.promotionType === 'PERCENTAGE' ? '0' : '0'}
            max={formData.promotionType === 'PERCENTAGE' ? '100' : undefined}
            step={formData.promotionType === 'PERCENTAGE' ? '0.01' : '1'}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            placeholder={formData.promotionType === 'PERCENTAGE' ? 'Nhập % (0-100)' : 'Nhập số tiền'}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Áp dụng cho model (tùy chọn)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {formData.selectedModelIds.length === 0
                    ? 'Tất cả các model'
                    : formData.selectedModelIds.length === 1
                      ? models.find(m => m.modelId === formData.selectedModelIds[0])?.modelName || `Model ${formData.selectedModelIds[0]}`
                      : `Đã chọn ${formData.selectedModelIds.length} model`}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${isModelDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </button>

              {isModelDropdownOpen && (
                <div className="w-full mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedModelIds.length === 0}
                        onChange={() => {
                          setFormData({ ...formData, selectedModelIds: [] });
                          setIsModelDropdownOpen(false);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-900">Tất cả các model</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {(Array.isArray(models) ? models : []).map((model) => {
                        const isSelected = formData.selectedModelIds.includes(model.modelId);
                        return (
                          <label
                            key={model.modelId}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newSelected = isSelected
                                  ? formData.selectedModelIds.filter(id => id !== model.modelId)
                                  : [...formData.selectedModelIds, model.modelId];
                                setFormData({ ...formData, selectedModelIds: newSelected });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-900">
                              {model.modelName || `Model ${model.modelId}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chọn "Tất cả các model" để cập nhật khuyến mãi hiện tại và tạo khuyến mãi mới cho tất cả các model còn lại. Chọn một hoặc nhiều model cụ thể để cập nhật và tạo khuyến mãi cho các model đó.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPromotion(null);
                setFormData({
                  promotionName: '',
                  description: '',
                  startDate: '',
                  endDate: '',
                  promotionType: '',
                  amount: '',
                  selectedModelIds: [],
                });
              }}
              className="flex-1"
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPromotion(null);
        }}
        title="Chi tiết Khuyến mãi"
        size="lg"
      >
        {selectedPromotion ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên chương trình</label>
                <p className="text-lg font-semibold mt-1">{selectedPromotion.promotionName || 'N/A'}</p>
              </div>
              {selectedPromotion.storeName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Đại lý</label>
                  <p className="text-lg mt-1">{selectedPromotion.storeName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                <p className="text-lg mt-1">{formatDate(selectedPromotion.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                <p className="text-lg mt-1">{formatDate(selectedPromotion.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loại khuyến mãi</label>
                <p className="text-lg mt-1">
                  {selectedPromotion.promotionType === 'PERCENTAGE' ? 'Phần trăm (%)' :
                    selectedPromotion.promotionType === 'FIXED_AMOUNT' ? 'Số tiền cố định' :
                      'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giá trị khuyến mãi</label>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {formatDiscount(selectedPromotion)}
                </p>
              </div>
              {selectedPromotion.modelId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Áp dụng cho mẫu xe</label>
                  <p className="text-lg mt-1">
                    {selectedPromotion.modelName ||
                      models.find(m => m.modelId === selectedPromotion.modelId)?.modelName ||
                      `Model ID: ${selectedPromotion.modelId}`}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(selectedPromotion)}
                </div>
              </div>
              {selectedPromotion.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-lg mt-1">{formatDate(selectedPromotion.createdAt)}</p>
                </div>
              )}
            </div>

            {selectedPromotion.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-base mt-1 text-gray-700">{selectedPromotion.description}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedPromotion(null);
                }}
                className="flex-1"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Không có dữ liệu</div>
          </div>
        )}
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Lỗi"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{errorModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              variant="outline"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPromotionToDelete(null);
        }}
        title="Xác nhận xóa"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa khuyến mãi <strong>"{promotionToDelete?.promotionName}"</strong> không?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <Button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPromotionToDelete(null);
              }}
              variant="outline"
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="danger"
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{successModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </DealerManagerLayout>
  );
};

export default PromotionPage;


