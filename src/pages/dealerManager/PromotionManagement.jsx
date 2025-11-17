import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchPromotions,
  fetchActivePromotions,
  createNewPromotion,
  createNewPromotionForAllModels,
  updatePromotionById,
  deletePromotionById,
  clearError,
  clearSuccess
} from '../../store/slices/promotionSlice';
import { getAllModels } from '../../api/modelService';
import { 
  Loader2, 
  AlertCircle, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Percent,
  Filter
} from 'lucide-react';

import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

function PromotionManagement() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { toast, success: showSuccess, showError: showToastError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const { promotions, loading, error, success } = useSelector((state) => state.promotions);
  
  // Get storeId from user context
  const userStoreId = user?.storeId || 0;
  
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [typeFilter, setTypeFilter] = useState('all'); // all, PERCENTAGE, FIXED_AMOUNT
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
  const [formData, setFormData] = useState({
    promotionName: '',
    description: '',
    promotionType: 'PERCENTAGE',
    amount: 0,
    startDate: '',
    endDate: '',
    modelId: 0,
    active: true
  });

  // Load data
  useEffect(() => {
    dispatch(fetchPromotions());
    loadModels();
  }, [dispatch]);

  // Load models for dropdown
  const loadModels = async () => {
    try {
      const response = await getAllModels();
      const modelList = response.data || response || [];
      setModels(modelList);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  // Filter promotions
  useEffect(() => {
    let filtered = [...promotions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(promo =>
        promo.promotionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(promo => {
        if (!promo.active) return false;
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return now >= start && now <= end;
      });
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(promo => !promo.active);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(promo => promo.promotionType === typeFilter);
    }

    // Group promotions by name and details, if there's one with modelId = 0, only show that one
    const groupedPromotions = new Map();
    filtered.forEach(promo => {
      // Create a unique key based on promotion details (excluding modelId)
      const key = `${promo.promotionName || ''}_${promo.promotionType || ''}_${promo.amount || 0}_${promo.startDate || ''}_${promo.endDate || ''}_${promo.storeId || 0}`;
      
      if (!groupedPromotions.has(key)) {
        groupedPromotions.set(key, []);
      }
      groupedPromotions.get(key).push(promo);
    });

    // For each group, if there's a promotion with modelId = 0, only keep that one
    // If multiple promotions with same details but different modelIds (and no modelId = 0),
    // create a summary promotion with modelId = 0 to represent "Tất cả model"
    const finalFiltered = [];
    const seenPromotionKeys = new Set();
    
    groupedPromotions.forEach((group, key) => {
      // First, check if there's a promotion with modelId = 0
      const allModelsPromo = group.find(p => p.modelId === 0 || p.modelId === null);
      if (allModelsPromo) {
        // If there's a promotion for all models, only show that one
        if (!seenPromotionKeys.has(key)) {
          finalFiltered.push(allModelsPromo);
          seenPromotionKeys.add(key);
        }
      } else if (group.length > 1) {
        // If multiple promotions with same details but different modelIds (and no modelId = 0)
        // Create a summary promotion with modelId = 0 to represent "Tất cả model"
        if (!seenPromotionKeys.has(key)) {
          const firstPromo = group[0];
          const summaryPromo = {
            ...firstPromo,
            modelId: 0,
            // Use the first promotion's ID or create a composite key
            promotionId: firstPromo.promotionId || `summary_${key}`,
            // Store all related promotion IDs for deletion
            relatedPromotionIds: group.map(p => p.promotionId).filter(id => id && !id.toString().startsWith('summary_'))
          };
          finalFiltered.push(summaryPromo);
          seenPromotionKeys.add(key);
        }
      } else {
        // Single promotion in group, show it normally
        if (!seenPromotionKeys.has(key)) {
          finalFiltered.push(group[0]);
          seenPromotionKeys.add(key);
        }
      }
    });

    setFilteredPromotions(finalFiltered);
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  // Clear messages after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Format currency: 50000000 -> 50.000.000
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    // Remove all non-digit characters
    const numericValue = String(value).replace(/\D/g, '');
    // Add dots as thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse currency: "50.000.000" -> 50000000
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove all non-digit characters
    return value.replace(/\D/g, '');
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If changing promotionType, format amount accordingly
    if (name === 'promotionType') {
      setFormData(prev => {
        let newAmount = prev.amount;
        // If switching to FIXED_AMOUNT and amount exists, format it
        if (value === 'FIXED_AMOUNT' && prev.amount) {
          newAmount = formatCurrency(prev.amount);
        }
        // If switching to PERCENTAGE and amount is formatted, remove dots
        else if (value === 'PERCENTAGE' && prev.amount) {
          newAmount = parseCurrency(prev.amount);
        }
        return {
          ...prev,
          [name]: value,
          amount: newAmount
        };
      });
    }
    // If changing amount and promotionType is FIXED_AMOUNT, format it
    else if (name === 'amount' && formData.promotionType === 'FIXED_AMOUNT') {
      const formatted = formatCurrency(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      promotionName: '',
      description: '',
      promotionType: 'PERCENTAGE',
      amount: '',
      startDate: '',
      endDate: '',
      modelId: 0,
      active: true
    });
  };

  // Add promotion
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      // Parse amount: if FIXED_AMOUNT, remove dots; otherwise use as is
      let parsedAmount = formData.amount;
      if (formData.promotionType === 'FIXED_AMOUNT') {
        parsedAmount = parseFloat(parseCurrency(formData.amount)) || 0;
      } else {
        parsedAmount = parseFloat(formData.amount) || 0;
      }

      const promotionData = {
        ...formData,
        amount: parsedAmount,
        modelId: parseInt(formData.modelId) || 0,
        storeId: userStoreId // Add storeId from user context
      };

      // If modelId is 0 (Tất cả các model), call create-for-all-models API once
      // This API will create promotions for all models automatically on the backend
      if (promotionData.modelId === 0) {
        await dispatch(createNewPromotionForAllModels(promotionData)).unwrap();
      } else {
        // Create single promotion for specific model using regular create API
        await dispatch(createNewPromotion(promotionData)).unwrap();
      }
      
      resetForm();
      setShowAddModal(false);
      dispatch(fetchPromotions());
    } catch (error) {
      console.error('Failed to create promotion:', error);
    }
  };

  // Edit promotion
  const handleEditClick = (promotion) => {
    setSelectedPromotion(promotion);
    // Format amount if it's FIXED_AMOUNT
    const formattedAmount = promotion.promotionType === 'FIXED_AMOUNT' && promotion.amount
      ? formatCurrency(promotion.amount)
      : promotion.amount || '';

    setFormData({
      promotionName: promotion.promotionName,
      description: promotion.description,
      promotionType: promotion.promotionType,
      amount: formattedAmount,
      startDate: promotion.startDate?.split('T')[0] || '',
      endDate: promotion.endDate?.split('T')[0] || '',
      modelId: promotion.modelId || 0,
      active: promotion.active
    });
    setShowEditModal(true);
  };

  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    if (!selectedPromotion) return;
    
    try {
      // Parse amount: if FIXED_AMOUNT, remove dots; otherwise use as is
      let parsedAmount = formData.amount;
      if (formData.promotionType === 'FIXED_AMOUNT') {
        parsedAmount = parseFloat(parseCurrency(formData.amount)) || 0;
      } else {
        parsedAmount = parseFloat(formData.amount) || 0;
      }

      await dispatch(updatePromotionById({
        promotionId: selectedPromotion.promotionId,
        promotionData: {
          ...formData,
          amount: parsedAmount,
          modelId: parseInt(formData.modelId) || 0,
          storeId: userStoreId // Add storeId from user context
        }
      })).unwrap();
      resetForm();
      setShowEditModal(false);
      setSelectedPromotion(null);
      dispatch(fetchPromotions());
    } catch (error) {
      console.error('Failed to update promotion:', error);
    }
  };

  // Delete promotion
  const handleDeleteClick = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    
    try {
      let promotionIdsToDelete = [];
      
      // If it's a summary promotion (modelId = 0) with relatedPromotionIds, use those
      if ((selectedPromotion.modelId === 0 || selectedPromotion.modelId === null) && selectedPromotion.relatedPromotionIds) {
        promotionIdsToDelete = selectedPromotion.relatedPromotionIds;
      } else {
        // Normalize dates for comparison
        const normalizedStartDate = normalizeDateString(selectedPromotion.startDate);
        const normalizedEndDate = normalizeDateString(selectedPromotion.endDate);
        
        // Find all promotions with the same name and details (regardless of modelId)
        const relatedPromotions = promotions.filter(promo => {
          // Skip summary promotions when searching
          if (promo.promotionId && promo.promotionId.toString().startsWith('summary_')) {
            return false;
          }
          
          const promoNormalizedStartDate = normalizeDateString(promo.startDate);
          const promoNormalizedEndDate = normalizeDateString(promo.endDate);
          
          return promo.promotionName === selectedPromotion.promotionName &&
                 promo.promotionType === selectedPromotion.promotionType &&
                 promo.amount === selectedPromotion.amount &&
                 promoNormalizedStartDate === normalizedStartDate &&
                 promoNormalizedEndDate === normalizedEndDate &&
                 promo.storeId === selectedPromotion.storeId;
        });
        
        // If it's a summary promotion or there are multiple related promotions, delete all
        if ((selectedPromotion.modelId === 0 || selectedPromotion.modelId === null) || relatedPromotions.length > 1) {
          promotionIdsToDelete = relatedPromotions.map(p => p.promotionId).filter(id => id);
        } else {
          // Delete single promotion for specific model
          if (selectedPromotion.promotionId && !selectedPromotion.promotionId.toString().startsWith('summary_')) {
            promotionIdsToDelete = [selectedPromotion.promotionId];
          }
        }
      }
      
      console.log('Promotion IDs to delete:', promotionIdsToDelete);
      
      // Delete all promotions
      if (promotionIdsToDelete.length > 0) {
        const deletePromises = promotionIdsToDelete.map(promotionId => 
          dispatch(deletePromotionById(promotionId)).unwrap()
        );
        await Promise.all(deletePromises);
      }
      
      setShowDeleteModal(false);
      setSelectedPromotion(null);
      dispatch(fetchPromotions());
    } catch (error) {
      console.error('Failed to delete promotion:', error);
    }
  };

  // View detail
  const handleViewDetail = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDetailModal(true);
  };

  // Check if promotion is currently active
  const isPromotionActive = (promotion) => {
    if (!promotion.active) return false;
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  };

  // Get status badge
  const getStatusBadge = (promotion) => {
    if (!promotion.active) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Vô hiệu hóa
        </span>
      );
    }
    
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    
    if (now < start) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Calendar className="h-3 w-3 mr-1" />
          Sắp diễn ra
        </span>
      );
    } else if (now > end) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Hết hạn
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Đang áp dụng
      </span>
    );
  };

  // Format amount
  const formatAmount = (amount, type) => {
    if (type === 'PERCENTAGE') {
      return `${amount}%`;
    }
    return `${amount.toLocaleString()}đ`;
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Normalize date string for comparison (remove time part, keep only date)
  const normalizeDateString = (dateString) => {
    if (!dateString) return '';
    // If date string includes time, extract only date part
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    // If date string is in format YYYY-MM-DD, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Try to parse and format as YYYY-MM-DD
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Tag className="h-6 w-6 mr-2 text-emerald-600" />
                Quản Lý Khuyến Mãi
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Tạo và quản lý các chương trình khuyến mãi cho sản phẩm
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-md text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo Khuyến Mãi
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Tổng khuyến mãi</p>
                  <p className="text-xl font-bold text-gray-900">{promotions.length}</p>
                </div>
                <Tag className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Đang áp dụng</p>
                  <p className="text-xl font-bold text-green-600">
                    {promotions.filter(p => isPromotionActive(p)).length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Giảm giá %</p>
                  <p className="text-xl font-bold text-blue-600">
                    {promotions.filter(p => p.promotionType === 'PERCENTAGE').length}
                  </p>
                </div>
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Giảm cố định</p>
                  <p className="text-xl font-bold text-purple-600">
                    {promotions.filter(p => p.promotionType === 'FIXED_AMOUNT').length}
                  </p>
                </div>
                <span className="text-sm font-semibold text-purple-600">VND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center"
            >
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang áp dụng</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tất cả loại</option>
                <option value="PERCENTAGE">Giảm theo %</option>
                <option value="FIXED_AMOUNT">Giảm cố định</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center p-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy khuyến mãi nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên khuyến mãi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại & Giá trị
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.promotionId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.promotionName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promotion.description?.substring(0, 50)}
                            {promotion.description?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {promotion.promotionType === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4 text-blue-600 mr-2" />
                          ) : (
                            <span className="text-xs font-semibold text-purple-600 mr-2">VND</span>
                          )}
                          <span className="text-sm font-semibold text-gray-900">
                            {formatAmount(promotion.amount, promotion.promotionType)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {promotion.promotionType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm cố định'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(promotion.startDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          đến {formatDate(promotion.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {promotion.modelId === 0 ? (
                          <span className="text-emerald-600 font-medium">Tất cả model</span>
                        ) : (
                          models.find(m => m.modelId === promotion.modelId)?.modelName || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(promotion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(promotion)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(promotion)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(promotion)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredPromotions.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Hiển thị {filteredPromotions.length} / {promotions.length} khuyến mãi
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Plus className="h-6 w-6 mr-2 text-emerald-600" />
                Tạo Khuyến Mãi Mới
              </h3>
            </div>
            
            <form onSubmit={handleAddPromotion} className="p-6">
              <div className="space-y-4">
                {/* Promotion Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="promotionName"
                    value={formData.promotionName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Giảm giá mùa hè"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                  />
                </div>

                {/* Promotion Type & Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại khuyến mãi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="promotionType"
                      value={formData.promotionType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Giảm cố định (VNĐ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá trị {formData.promotionType === 'PERCENTAGE' ? '(%)' : '(VNĐ)'} <span className="text-red-500">*</span>
                    </label>
                    {formData.promotionType === 'FIXED_AMOUNT' ? (
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="VD: 50.000.000"
                      />
                    ) : (
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="VD: 10"
                      />
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          formData.startDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: formData.startDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!formData.startDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-3 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        min={formData.startDate}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          formData.endDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: formData.endDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!formData.endDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-3 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Áp dụng cho Model
                  </label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="0">Tất cả các model</option>
                    {models.map(model => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </option>
                    ))}
                  </select>
                 
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {formData.modelId === 0 ? 'Đang tạo cho tất cả model...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      {formData.modelId === 0 ? 'Tạo Cho Tất Cả Model' : 'Tạo Khuyến Mãi'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Edit className="h-6 w-6 mr-2 text-emerald-600" />
                Chỉnh Sửa Khuyến Mãi
              </h3>
            </div>
            
            <form onSubmit={handleUpdatePromotion} className="p-6">
              <div className="space-y-4">
                {/* Same form fields as Add Modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="promotionName"
                    value={formData.promotionName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại khuyến mãi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="promotionType"
                      value={formData.promotionType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="PERCENTAGE">Giảm theo %</option>
                      <option value="FIXED_AMOUNT">Giảm cố định</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá trị <span className="text-red-500">*</span>
                    </label>
                    {formData.promotionType === 'FIXED_AMOUNT' ? (
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="VD: 50.000.000"
                      />
                    ) : (
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="VD: 10"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          formData.startDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: formData.startDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!formData.startDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-3 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          formData.endDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: formData.endDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!formData.endDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-3 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Áp dụng cho Model
                  </label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="0">Tất cả</option>
                    {models.map(model => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPromotion(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập Nhật'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {selectedPromotion.modelId === 0 || selectedPromotion.modelId === null ? (
                  <>
                    Bạn có chắc chắn muốn xóa khuyến mãi <br />
                    <span className="font-semibold text-gray-900">"{selectedPromotion.promotionName}"</span>?<br />
                    <span className="text-red-600 font-medium text-sm mt-2 block">
                      Lưu ý: Điều này sẽ xóa khuyến mãi cho tất cả các model!
                    </span>
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn xóa khuyến mãi <br />
                    <span className="font-semibold text-gray-900">"{selectedPromotion.promotionName}"</span>?
                  </>
                )}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPromotion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Eye className="h-6 w-6 mr-2 text-emerald-600" />
                  Chi Tiết Khuyến Mãi
                </h3>
                {getStatusBadge(selectedPromotion)}
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedPromotion.promotionName}
                  </h4>
                  <p className="text-gray-600">{selectedPromotion.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      {selectedPromotion.promotionType === 'PERCENTAGE' ? (
                        <Percent className="h-5 w-5 text-blue-600 mr-2" />
                      ) : (
                        <span className="text-sm font-semibold text-purple-600 mr-2">VND</span>
                      )}
                      <span className="text-sm font-medium text-gray-700">Loại khuyến mãi</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedPromotion.promotionType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm cố định'}
                    </p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Giá trị</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatAmount(selectedPromotion.amount, selectedPromotion.promotionType)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Thời gian áp dụng</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Bắt đầu</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(selectedPromotion.startDate)}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="text-xs text-gray-500">Kết thúc</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(selectedPromotion.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Tag className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Áp dụng cho</span>
                  </div>
                  <p className="text-gray-900">
                    {selectedPromotion.modelId === 0 ? (
                      <span className="text-emerald-600 font-semibold">Tất cả các model</span>
                    ) : (
                      models.find(m => m.modelId === selectedPromotion.modelId)?.modelName || 'N/A'
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Trạng thái kích hoạt</span>
                  </div>
                  <p className="text-gray-900">
                    {selectedPromotion.active ? (
                      <span className="text-green-600 font-semibold">Đã kích hoạt</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Chưa kích hoạt</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPromotion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditClick(selectedPromotion);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all"
                >
                  Chỉnh Sửa
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PromotionManagement;

