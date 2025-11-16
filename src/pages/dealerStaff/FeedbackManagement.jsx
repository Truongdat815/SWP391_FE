import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAllFeedbacks, updateFeedbackStatus, createFeedback, updateFeedback } from '@/api/feedbackService';
import { getFeedbackDetailsByFeedbackId, createFeedbackDetail, updateFeedbackDetail } from '@/api/feedbackDetailService';
import { getAllOrders } from '@/api/orderService';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function FeedbackManagement({ onBack }) {
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'date', 'order'
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);
  
  const [resolveForm, setResolveForm] = useState({
    resolution: '',
    notes: ''
  });

  const [createForm, setCreateForm] = useState({
    orderId: '',
    customerName: '',
    category: 'service',
    rating: 5,
    content: '',
    status: 'DRAFT'
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

  // Fetch orders when opening create/edit form
  useEffect(() => {
    const fetchOrders = async () => {
      if (showCreateForm || showEditForm) {
        try {
          setLoadingOrders(true);
          console.log('🔄 [FeedbackManagement] Đang tải danh sách đơn hàng...');
          const response = await getAllOrders();
          
          // Handle different response structures
          let ordersData = [];
          if (Array.isArray(response)) {
            ordersData = response;
          } else if (response?.data && Array.isArray(response.data)) {
            ordersData = response.data;
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
          }
          
          console.log('✅ [FeedbackManagement] Đã tải danh sách đơn hàng:', ordersData.length);
          setOrders(ordersData);
        } catch (err) {
          console.error('❌ [FeedbackManagement] Lỗi khi tải danh sách đơn hàng:', err);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    
    fetchOrders();
  }, [showCreateForm, showEditForm]);

  // Get feedback count for an order
  const getFeedbackCountForOrder = (orderId) => {
    if (!orderId) return 0;
    const orderIdInt = parseInt(orderId);
    return feedbacks.filter(f => {
      const fOrderId = parseInt(f.orderId);
      return fOrderId === orderIdInt;
    }).length;
  };

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    if (!orderId || orderId === '') {
      // Reset form if no order selected
      setCreateForm(prev => ({
        ...prev,
        orderId: '',
        customerName: ''
      }));
      return;
    }
    
    const selectedOrder = orders.find(order => {
      const oId = order.orderId || order.id || order.order_id;
      return oId === parseInt(orderId) || oId.toString() === orderId.toString();
    });
    
    if (selectedOrder) {
      const customerName = selectedOrder.customerName || 
                          selectedOrder.customer?.fullName || 
                          selectedOrder.customer?.customerName ||
                          selectedOrder.customer?.name ||
                          'N/A';
      
      const feedbackCount = getFeedbackCountForOrder(orderId);
      
      setCreateForm(prev => ({
        ...prev,
        orderId: orderId.toString(),
        customerName: customerName
      }));
      
      console.log('✅ [FeedbackManagement] Đã chọn đơn hàng:', {
        orderId: selectedOrder.orderId || selectedOrder.id,
        customerName: customerName,
        existingFeedbackCount: feedbackCount,
        fullOrder: selectedOrder
      });
      
      // Show info if order already has feedbacks
      if (feedbackCount > 0) {
        console.log(`ℹ️ [FeedbackManagement] Đơn hàng này đã có ${feedbackCount} phản hồi`);
      }
    } else {
      console.warn('⚠️ [FeedbackManagement] Không tìm thấy đơn hàng với ID:', orderId);
      showError('Không tìm thấy đơn hàng được chọn!');
    }
  };

  // Function to fetch feedbacks (can be called from anywhere)
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [FeedbackManagement] Đang tải danh sách phản hồi...');
      const response = await getAllFeedbacks();
      
      // Debug: Log toàn bộ response để kiểm tra
      console.log('📥 [FeedbackManagement] Raw API Response:', response);
      console.log('📥 [FeedbackManagement] Response type:', typeof response);
      console.log('📥 [FeedbackManagement] Is Array?', Array.isArray(response));
      if (response && typeof response === 'object') {
        console.log('📥 [FeedbackManagement] Response keys:', Object.keys(response));
      }
      
      // Handle different response structures
      let feedbacksData = [];
      
      // Check if response is directly an array
      if (Array.isArray(response)) {
        feedbacksData = response;
        console.log('✅ [FeedbackManagement] Response là array, số lượng:', feedbacksData.length);
      }
      // Check if response.data is an array
      else if (response?.data && Array.isArray(response.data)) {
        feedbacksData = response.data;
        console.log('✅ [FeedbackManagement] Response.data là array, số lượng:', feedbacksData.length);
      }
      // Check if response.data.data is an array
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        feedbacksData = response.data.data;
        console.log('✅ [FeedbackManagement] Response.data.data là array, số lượng:', feedbacksData.length);
      }
      // Try other possible structures
      else if (response?.data && !Array.isArray(response.data)) {
        console.log('⚠️ [FeedbackManagement] Response.data không phải array:', response.data);
        // Try to extract array from response.data
        if (response.data.list && Array.isArray(response.data.list)) {
          feedbacksData = response.data.list;
          console.log('✅ [FeedbackManagement] Tìm thấy response.data.list');
        } else if (response.data.feedbacks && Array.isArray(response.data.feedbacks)) {
          feedbacksData = response.data.feedbacks;
          console.log('✅ [FeedbackManagement] Tìm thấy response.data.feedbacks');
        } else if (response.data.items && Array.isArray(response.data.items)) {
          feedbacksData = response.data.items;
          console.log('✅ [FeedbackManagement] Tìm thấy response.data.items');
        } else {
          console.warn('⚠️ [FeedbackManagement] Không tìm thấy array trong response');
        }
      }
      
      console.log('📊 [FeedbackManagement] Processed feedbacksData:', feedbacksData);
      console.log('📊 [FeedbackManagement] Số lượng feedbacks:', feedbacksData.length);
      
      if (feedbacksData.length === 0) {
        console.warn('⚠️ [FeedbackManagement] Không có feedback nào trong response');
        setFeedbacks([]);
        setLoading(false);
        return;
      }
      
      // Map API response to component format
      const mappedFeedbacks = await Promise.all(
        feedbacksData.map(async (feedback, index) => {
          console.log(`🔄 [FeedbackManagement] Đang xử lý feedback ${index + 1}/${feedbacksData.length}:`, feedback);
          
          // Try to get feedback details for content, rating, category
          let feedbackDetail = null;
          try {
            const feedbackId = feedback.feedbackId || feedback.id || feedback.feedback_id;
            if (feedbackId) {
              console.log(`🔍 [FeedbackManagement] Đang lấy feedback detail cho feedbackId: ${feedbackId}`);
              const detailResponse = await getFeedbackDetailsByFeedbackId(feedbackId);
              console.log(`📥 [FeedbackManagement] Detail response raw:`, detailResponse);
              
              // Try multiple response structures
              let details = null;
              if (Array.isArray(detailResponse)) {
                details = detailResponse;
              } else if (detailResponse?.data) {
                if (Array.isArray(detailResponse.data)) {
                  details = detailResponse.data;
                } else if (detailResponse.data?.data && Array.isArray(detailResponse.data.data)) {
                  details = detailResponse.data.data;
                } else {
                  details = detailResponse.data;
                }
              } else {
                details = detailResponse;
              }
              
              console.log(`📊 [FeedbackManagement] Processed details:`, details);
              
              if (Array.isArray(details) && details.length > 0) {
                feedbackDetail = details[0];
                console.log(`✅ [FeedbackManagement] Tìm thấy feedback detail (array) cho feedback ${index + 1}:`, feedbackDetail);
              } else if (details && !Array.isArray(details) && (details.rating !== undefined || details.content !== undefined)) {
                feedbackDetail = details;
                console.log(`✅ [FeedbackManagement] Tìm thấy feedback detail (single) cho feedback ${index + 1}:`, feedbackDetail);
              } else {
                console.log(`ℹ️ [FeedbackManagement] Không có feedback detail cho feedback ${index + 1}, details:`, details);
              }
            }
          } catch (err) {
            console.log(`ℹ️ [FeedbackManagement] Lỗi khi lấy feedback detail cho feedback ${index + 1}:`, err.message, err);
          }
          
          // Parse rating - ensure it's a number
          let ratingValue = 0;
          if (feedbackDetail?.rating !== undefined && feedbackDetail?.rating !== null) {
            ratingValue = parseInt(feedbackDetail.rating) || 0;
          } else if (feedback?.rating !== undefined && feedback?.rating !== null) {
            ratingValue = parseInt(feedback.rating) || 0;
          }
          
          // Get content
          let contentValue = 'Không có nội dung';
          if (feedbackDetail?.content) {
            contentValue = feedbackDetail.content;
          } else if (feedback?.content) {
            contentValue = feedback.content;
          }
          
          // Get category
          let categoryValue = 'service';
          if (feedbackDetail?.category) {
            categoryValue = (feedbackDetail.category || 'service').toLowerCase();
          } else if (feedback?.category) {
            categoryValue = (feedback.category || 'service').toLowerCase();
          }
          
          console.log(`📝 [FeedbackManagement] Mapped values cho feedback ${index + 1}:`, {
            rating: ratingValue,
            content: contentValue,
            category: categoryValue,
            hasDetail: !!feedbackDetail
          });
          
          const mapped = {
            id: feedback.feedbackId || feedback.id || feedback.feedback_id,
            feedbackId: feedback.feedbackId || feedback.id || feedback.feedback_id,
            customerName: feedback.customerName || feedback.customer_name || 'N/A',
            orderNumber: feedback.orderId ? `HD-${feedback.orderId}` : feedback.orderNumber || 'N/A',
            orderId: feedback.orderId || feedback.order_id,
            vehicleModel: feedback.vehicleModel || feedback.vehicle_model || 'N/A',
            category: categoryValue,
            rating: ratingValue,
            content: contentValue,
            status: (feedback.status || 'pending').toLowerCase(),
            createdAt: feedback.createdAt || feedback.created_at || feedback.createdDate || new Date().toISOString().split('T')[0],
            resolvedAt: feedback.resolvedAt || feedback.resolved_at || feedback.resolvedDate || null,
            feedbackDetailId: feedbackDetail?.feedbackDetailId || feedbackDetail?.id || null
          };
          
          console.log(`✅ [FeedbackManagement] Đã map feedback ${index + 1}:`, mapped);
          return mapped;
        })
      );
      
      // Sort by newest first (default)
      mappedFeedbacks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Newest first
      });
      
      console.log('✅ [FeedbackManagement] Final mapped feedbacks:', mappedFeedbacks);
      console.log('✅ [FeedbackManagement] Tổng số feedbacks:', mappedFeedbacks.length);
      
      setFeedbacks(mappedFeedbacks);
      setLoading(false);
    } catch (err) {
      console.error('❌ [FeedbackManagement] Lỗi khi tải feedbacks:', err);
      setError(err.message || 'Không thể tải danh sách phản hồi');
      setFeedbacks([]);
      setLoading(false);
    }
  }, []);

  // Load feedbacks from API on mount
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Sort feedbacks - use useMemo to avoid infinite loop
  const sortedFeedbacks = useMemo(() => {
    if (feedbacks.length === 0) return feedbacks;
    
    const sorted = [...feedbacks];
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Newest first
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA - dateB; // Oldest first
        });
        break;
      case 'name':
        sorted.sort((a, b) => {
          const nameA = (a.customerName || '').toLowerCase();
          const nameB = (b.customerName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Newest first
        });
        break;
      case 'order':
        sorted.sort((a, b) => {
          const orderA = parseInt(a.orderId) || 0;
          const orderB = parseInt(b.orderId) || 0;
          return orderB - orderA; // Higher order ID first
        });
        break;
      default:
        break;
    }
    
    return sorted;
  }, [feedbacks, sortBy]);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
      case 'inprogress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending': return 'Chờ xử lý';
      case 'draft': return 'Bản nháp';
      case 'in_progress':
      case 'inprogress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      default: return status || 'N/A';
    }
  };

  const getCategoryText = (category) => {
    const normalizedCategory = category?.toLowerCase();
    switch (normalizedCategory) {
      case 'service': return 'Dịch vụ';
      case 'product': return 'Sản phẩm';
      case 'complaint': return 'Khiếu nại';
      default: return category || 'Khác';
    }
  };

  const getCategoryColor = (category) => {
    const normalizedCategory = category?.toLowerCase();
    switch (normalizedCategory) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'product': return 'bg-green-100 text-green-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    
    try {
      const feedbackId = selectedFeedback.feedbackId || selectedFeedback.id;
      
      // Update status to RESOLVED
      await updateFeedbackStatus(feedbackId, 'RESOLVED');
      
      // Update local state
      setFeedbacks(prevFeedbacks => prevFeedbacks.map(feedback => {
        if (feedback.id === feedbackId || feedback.feedbackId === feedbackId) {
          return {
            ...feedback,
            status: 'resolved',
            resolvedAt: new Date().toISOString().split('T')[0]
          };
        }
        return feedback;
      }));
      setShowResolveForm(false);
      setSelectedFeedback(null);
      setResolveForm({ resolution: '', notes: '' });
      
      success('Phản hồi đã được đánh dấu là đã giải quyết!');
    } catch (err) {
      console.error('Error resolving feedback:', err);
      showError('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  const openResolveForm = (feedback) => {
    setSelectedFeedback(feedback);
    setShowResolveForm(true);
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      // Map lowercase status to uppercase for API
      const apiStatus = newStatus.toUpperCase().replace('-', '_');
      
      await updateFeedbackStatus(feedbackId, apiStatus);
      
      // Update local state
      setFeedbacks(prevFeedbacks => prevFeedbacks.map(feedback => {
        if (feedback.id === feedbackId || feedback.feedbackId === feedbackId) {
          return {
            ...feedback,
            status: newStatus.toLowerCase()
          };
        }
        return feedback;
      }));
      
      success(`Đã cập nhật trạng thái thành ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error('Error updating feedback status:', err);
      showError('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!createForm.orderId || createForm.orderId === '') {
        showError('Vui lòng chọn đơn hàng!');
        return;
      }
      
      if (!createForm.customerName || createForm.customerName === '') {
        showError('Vui lòng chọn đơn hàng để tự động điền tên khách hàng!');
        return;
      }

      if (!createForm.content || createForm.content.trim() === '') {
        showError('Vui lòng nhập nội dung phản hồi!');
        return;
      }

      if (!createForm.rating || createForm.rating < 1 || createForm.rating > 5) {
        showError('Vui lòng chọn đánh giá từ 1 đến 5 sao!');
        return;
      }
      
      const orderIdInt = parseInt(createForm.orderId);
      if (isNaN(orderIdInt) || orderIdInt <= 0) {
        showError('Mã đơn hàng không hợp lệ!');
        return;
      }
      
      console.log('🔄 [FeedbackManagement] Đang tạo feedback:', createForm);
      console.log('🔄 [FeedbackManagement] OrderId (parsed):', orderIdInt);
      
      // Create feedback with all data (API may require rating, content, category in main request)
      const feedbackResponse = await createFeedback({
        orderId: orderIdInt,
        customerName: createForm.customerName,
        status: createForm.status,
        category: createForm.category.toUpperCase(),
        rating: createForm.rating,
        content: createForm.content.trim()
      });
      
      console.log('📥 [FeedbackManagement] Create feedback response:', feedbackResponse);
      
      const feedbackId = feedbackResponse?.data?.feedbackId || 
                        feedbackResponse?.feedbackId || 
                        feedbackResponse?.data?.id ||
                        feedbackResponse?.id;
      
      if (!feedbackId) {
        console.error('❌ [FeedbackManagement] Không thể lấy feedbackId từ response:', feedbackResponse);
        throw new Error('Không thể lấy feedbackId từ API response');
      }
      
      console.log('✅ [FeedbackManagement] Đã tạo feedback với ID:', feedbackId);
      
      // Try to create feedback detail if API doesn't automatically create it
      // Some APIs may create detail automatically when rating/content/category are provided
      // So we try to create detail, but don't fail if it already exists or isn't needed
      try {
        const detailResponse = await createFeedbackDetail({
          feedbackId: feedbackId,
          category: createForm.category.toUpperCase(),
          rating: createForm.rating,
          content: createForm.content.trim()
        });
        
        console.log('✅ [FeedbackManagement] Đã tạo feedback detail:', detailResponse);
      } catch (detailErr) {
        // Check if error is because detail already exists or isn't needed
        const errorMsg = detailErr.message || '';
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate') ||
            errorMsg.includes('already created')) {
          console.log('ℹ️ [FeedbackManagement] Feedback detail đã tồn tại, bỏ qua');
        } else {
          console.warn('⚠️ [FeedbackManagement] Không thể tạo feedback detail:', detailErr);
          // Don't throw error - main feedback was created successfully
          // Detail might have been created automatically by API
        }
      }
      
      // Close form and reset
      setShowCreateForm(false);
      setCreateForm({
        orderId: '',
        customerName: '',
        category: 'service',
        rating: 5,
        content: '',
        status: 'DRAFT'
      });
      
      success('Tạo phản hồi thành công!');
      
      // Refresh feedbacks list without reloading page
      await fetchFeedbacks();
    } catch (err) {
      console.error('❌ [FeedbackManagement] Lỗi khi tạo feedback:', err);
      console.error('❌ [FeedbackManagement] Error details:', {
        message: err.message,
        stack: err.stack,
        createForm: createForm
      });
      
      let errorMessage = 'Lỗi khi tạo phản hồi';
      
      // Xử lý các loại lỗi khác nhau
      if (err.message) {
        if (err.message.includes('502') || err.message.includes('Bad Gateway')) {
          errorMessage = 'Lỗi kết nối đến server. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.';
        } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'Không tìm thấy API endpoint. Vui lòng liên hệ quản trị viên.';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else {
          errorMessage += ': ' + err.message;
        }
      } else if (err.response?.data?.message) {
        errorMessage += ': ' + err.response.data.message;
      } else {
        errorMessage += '. Vui lòng thử lại hoặc kiểm tra console để biết thêm chi tiết.';
      }
      
      // Đảm bảo showError luôn được gọi an toàn
      try {
        if (typeof showError === 'function') {
          showError(errorMessage);
        } else {
          console.error('⚠️ showError is not a function, showing alert instead');
          alert(errorMessage);
        }
      } catch (displayErr) {
        console.error('❌ Lỗi khi hiển thị error message:', displayErr);
        alert(errorMessage);
      }
    }
  };

  const handleEditFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setCreateForm({
      orderId: feedback.orderId?.toString() || '',
      customerName: feedback.customerName || '',
      category: feedback.category || 'service',
      rating: feedback.rating || 5,
      content: feedback.content || '',
      status: feedback.status?.toUpperCase() || 'DRAFT'
    });
    setShowEditForm(true);
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    
    try {
      // Validation
      if (!createForm.orderId || createForm.orderId === '') {
        showError('Vui lòng chọn đơn hàng!');
        return;
      }
      
      if (!createForm.customerName || createForm.customerName === '') {
        showError('Vui lòng chọn đơn hàng để tự động điền tên khách hàng!');
        return;
      }
      
      const orderIdInt = parseInt(createForm.orderId);
      if (isNaN(orderIdInt) || orderIdInt <= 0) {
        showError('Mã đơn hàng không hợp lệ!');
        return;
      }
      
      const feedbackId = selectedFeedback.feedbackId || selectedFeedback.id;
      
      console.log('🔄 [FeedbackManagement] Đang cập nhật feedback:', feedbackId, createForm);
      console.log('🔄 [FeedbackManagement] OrderId (parsed):', orderIdInt);
      
      // Update feedback
      await updateFeedback(feedbackId, {
        orderId: orderIdInt,
        customerName: createForm.customerName,
        status: createForm.status
      });
      
      // Update feedback detail if exists
      if (selectedFeedback.feedbackDetailId) {
        await updateFeedbackDetail(selectedFeedback.feedbackDetailId, {
          category: createForm.category.toUpperCase(),
          rating: createForm.rating,
          content: createForm.content
        });
      } else {
        // Create new detail if doesn't exist
        await createFeedbackDetail({
          feedbackId: feedbackId,
          category: createForm.category.toUpperCase(),
          rating: createForm.rating,
          content: createForm.content
        });
      }
      
      console.log('✅ [FeedbackManagement] Đã cập nhật feedback');
      
      // Close form
      setShowEditForm(false);
      setSelectedFeedback(null);
      
      success('Cập nhật phản hồi thành công!');
      
      // Refresh feedbacks list without reloading page
      await fetchFeedbacks();
    } catch (err) {
      console.error('❌ [FeedbackManagement] Lỗi khi cập nhật feedback:', err);
      showError('Lỗi khi cập nhật phản hồi: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  const renderStars = (rating) => {
    // Ensure rating is a number between 0 and 5
    const ratingNum = typeof rating === 'number' ? rating : parseInt(rating) || 0;
    const clampedRating = Math.max(0, Math.min(5, ratingNum));
    
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= clampedRating;
      
      return (
        <svg
          key={index}
          className={`h-4 w-4 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          fill={isFilled ? 'currentColor' : 'none'}
          stroke={isFilled ? 'currentColor' : 'currentColor'}
          strokeWidth={isFilled ? 0 : 1}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    });
  };

  // Interactive star rating selector component
  const StarRatingSelector = ({ value, onChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverRating || value);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`h-8 w-8 ${isFilled ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  };

  const getSortText = () => {
    switch (sortBy) {
      case 'newest': return 'Mới nhất';
      case 'oldest': return 'Cũ nhất';
      case 'name': return 'Theo tên';
      case 'date': return 'Theo ngày';
      case 'order': return 'Theo đơn hàng';
      default: return 'Sắp xếp';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
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
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Quản lý phản hồi & khiếu nại</h2>
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {getSortText()}
                <svg className={`h-4 w-4 ml-2 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-200 z-50">
                  <button
                    onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${sortBy === 'newest' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => { setSortBy('oldest'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${sortBy === 'oldest' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    Cũ nhất
                  </button>
                  <button
                    onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${sortBy === 'name' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    Theo tên
                  </button>
                  <button
                    onClick={() => { setSortBy('date'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${sortBy === 'date' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    Theo ngày
                  </button>
                  <button
                    onClick={() => { setSortBy('order'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${sortBy === 'order' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
                  >
                    Theo đơn hàng
                  </button>
                </div>
              )}
            </div>
            
            {/* Create Feedback Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo phản hồi
            </button>
            
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-xl font-bold text-gray-900">
                  {sortedFeedbacks.filter(f => f.status === 'pending' || f.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-xl font-bold text-gray-900">
                  {sortedFeedbacks.filter(f => f.status === 'in_progress' || f.status === 'inprogress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                <p className="text-xl font-bold text-gray-900">
                  {sortedFeedbacks.filter(f => f.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng phản hồi</p>
                <p className="text-xl font-bold text-gray-900">{sortedFeedbacks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Feedback Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateForm(false)}>
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tạo phản hồi mới</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn hàng *</label>
                  {loadingOrders ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-600 mr-2"></div>
                      <span className="text-sm text-gray-500">Đang tải...</span>
                    </div>
                  ) : (
                    <select
                      value={createForm.orderId}
                      onChange={(e) => handleOrderSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn đơn hàng --</option>
                      {orders.map((order) => {
                        const orderId = order.orderId || order.id || order.order_id;
                        const orderCode = order.orderCode || order.order_code || `HD-${orderId}`;
                        const customerName = order.customerName || 
                                            order.customer?.fullName || 
                                            order.customer?.customerName || 
                                            order.customer?.name ||
                                            'N/A';
                        const feedbackCount = getFeedbackCountForOrder(orderId);
                        const feedbackInfo = feedbackCount > 0 ? ` (${feedbackCount} phản hồi)` : '';
                        return (
                          <option key={orderId} value={orderId}>
                            {orderCode} - {customerName}{feedbackInfo}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="service">Dịch vụ</option>
                    <option value="product">Sản phẩm</option>
                    <option value="complaint">Khiếu nại</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (1-5) *</label>
                  <StarRatingSelector
                    value={createForm.rating}
                    onChange={(rating) => setCreateForm(prev => ({ ...prev, rating }))}
                  />
                  {/* No hidden input needed - validation is handled in handleCreateFeedback */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    placeholder="Nhập nội dung phản hồi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Tạo phản hồi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Feedback Modal */}
        {showEditForm && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setShowEditForm(false); setSelectedFeedback(null); }}>
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa phản hồi</h3>
                <button
                  onClick={() => { setShowEditForm(false); setSelectedFeedback(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn hàng *</label>
                  {loadingOrders ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-600 mr-2"></div>
                      <span className="text-sm text-gray-500">Đang tải...</span>
                    </div>
                  ) : (
                    <select
                      value={createForm.orderId}
                      onChange={(e) => handleOrderSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn đơn hàng --</option>
                      {orders.map((order) => {
                        const orderId = order.orderId || order.id || order.order_id;
                        const orderCode = order.orderCode || order.order_code || `HD-${orderId}`;
                        const customerName = order.customerName || 
                                            order.customer?.fullName || 
                                            order.customer?.customerName || 
                                            order.customer?.name ||
                                            'N/A';
                        const feedbackCount = getFeedbackCountForOrder(orderId);
                        const feedbackInfo = feedbackCount > 0 ? ` (${feedbackCount} phản hồi)` : '';
                        return (
                          <option key={orderId} value={orderId}>
                            {orderCode} - {customerName}{feedbackInfo}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="service">Dịch vụ</option>
                    <option value="product">Sản phẩm</option>
                    <option value="complaint">Khiếu nại</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (1-5) *</label>
                  <StarRatingSelector
                    value={createForm.rating}
                    onChange={(rating) => setCreateForm(prev => ({ ...prev, rating }))}
                  />
                  {/* No hidden input needed - validation is handled in handleUpdateFeedback */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    placeholder="Nhập nội dung phản hồi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="RESOLVED">Đã giải quyết</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => { setShowEditForm(false); setSelectedFeedback(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolve Form Modal */}
        {showResolveForm && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giải quyết phản hồi</h3>
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khách hàng</label>
                  <p className="text-sm text-gray-600">{selectedFeedback.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung phản hồi</label>
                  <p className="text-sm text-gray-600">{selectedFeedback.content}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giải pháp *</label>
                  <textarea
                    value={resolveForm.resolution}
                    onChange={(e) => setResolveForm(prev => ({ ...prev, resolution: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    placeholder="Mô tả giải pháp đã thực hiện..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={resolveForm.notes}
                    onChange={(e) => setResolveForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowResolveForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Đánh dấu đã giải quyết
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách phản hồi...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Feedbacks List */}
        {!loading && !error && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách phản hồi</h3>
            <div className="space-y-4">
              {sortedFeedbacks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Chưa có phản hồi nào</p>
                </div>
              ) : (
                sortedFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="font-semibold text-gray-900">{feedback.customerName}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(feedback.category)}`}>
                            {getCategoryText(feedback.category)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                            {getStatusText(feedback.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>HĐ: {feedback.orderNumber}</span>
                          <span>Xe: {feedback.vehicleModel}</span>
                          <span>Ngày: {feedback.createdAt}</span>
                          <div className="flex items-center">
                            <span className="mr-1">Đánh giá:</span>
                            <div className="flex">{renderStars(feedback.rating)}</div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{feedback.content}</p>
                        {feedback.resolvedAt && (
                          <p className="text-sm text-green-600">Đã giải quyết: {feedback.resolvedAt}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {(feedback.status === 'pending' || feedback.status === 'draft') && (
                          <button
                            onClick={() => handleUpdateStatus(feedback.feedbackId || feedback.id, 'in_progress')}
                            className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            Bắt đầu xử lý
                          </button>
                        )}
                        {(feedback.status === 'in_progress' || feedback.status === 'inprogress') && (
                          <button
                            onClick={() => openResolveForm(feedback)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Giải quyết
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditFeedback(feedback)}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                          
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackManagement;
