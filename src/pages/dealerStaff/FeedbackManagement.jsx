import { useState, useEffect } from 'react';
import { getAllFeedbacks, updateFeedbackStatus } from '@/api/feedbackService';
import { getFeedbackDetailsByFeedbackId } from '@/api/feedbackDetailService';

function FeedbackManagement({ onBack }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    resolution: '',
    notes: ''
  });

  // Load feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAllFeedbacks();
        
        // Handle different response structures
        let feedbacksData = [];
        if (response?.data && Array.isArray(response.data)) {
          feedbacksData = response.data;
        } else if (Array.isArray(response)) {
          feedbacksData = response;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          feedbacksData = response.data.data;
        }
        
        // Map API response to component format
        const mappedFeedbacks = await Promise.all(
          feedbacksData.map(async (feedback) => {
            // Try to get feedback details for content, rating, category
            let feedbackDetail = null;
            try {
              const detailResponse = await getFeedbackDetailsByFeedbackId(feedback.feedbackId || feedback.id);
              const details = detailResponse?.data || detailResponse;
              if (Array.isArray(details) && details.length > 0) {
                feedbackDetail = details[0]; // Take first detail
              } else if (details && !Array.isArray(details)) {
                feedbackDetail = details;
              }
            } catch (err) {
              console.log('No feedback detail found for feedback:', feedback.feedbackId || feedback.id);
            }
            
            return {
              id: feedback.feedbackId || feedback.id,
              feedbackId: feedback.feedbackId || feedback.id,
              customerName: feedback.customerName || feedback.customer_name || 'N/A',
              orderNumber: feedback.orderId ? `HD-${feedback.orderId}` : feedback.orderNumber || 'N/A',
              orderId: feedback.orderId,
              vehicleModel: feedback.vehicleModel || feedback.vehicle_model || 'N/A',
              category: (feedbackDetail?.category || feedback.category || 'service').toLowerCase(),
              rating: feedbackDetail?.rating || feedback.rating || 0,
              content: feedbackDetail?.content || feedback.content || 'Không có nội dung',
              status: (feedback.status || 'pending').toLowerCase(),
              createdAt: feedback.createdAt || feedback.created_at || feedback.createdDate || new Date().toISOString().split('T')[0],
              resolvedAt: feedback.resolvedAt || feedback.resolved_at || feedback.resolvedDate || null
            };
          })
        );
        
        setFeedbacks(mappedFeedbacks);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError(err.message || 'Không thể tải danh sách phản hồi');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, []);

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
      const updatedFeedbacks = feedbacks.map(feedback => {
        if (feedback.id === feedbackId || feedback.feedbackId === feedbackId) {
          return {
            ...feedback,
            status: 'resolved',
            resolvedAt: new Date().toISOString().split('T')[0]
          };
        }
        return feedback;
      });
      setFeedbacks(updatedFeedbacks);
      setShowResolveForm(false);
      setSelectedFeedback(null);
      setResolveForm({ resolution: '', notes: '' });
      
      alert('Phản hồi đã được đánh dấu là đã giải quyết!');
    } catch (err) {
      console.error('Error resolving feedback:', err);
      alert('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Vui lòng thử lại'));
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
      const updatedFeedbacks = feedbacks.map(feedback => {
        if (feedback.id === feedbackId || feedback.feedbackId === feedbackId) {
          return {
            ...feedback,
            status: newStatus.toLowerCase()
          };
        }
        return feedback;
      });
      setFeedbacks(updatedFeedbacks);
      
      alert(`Đã cập nhật trạng thái thành ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error('Error updating feedback status:', err);
      alert('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý phản hồi & khiếu nại</h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
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
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'pending').length}
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
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'in_progress').length}
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
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'resolved').length}
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
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
            </div>
          </div>
        </div>

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
              {feedbacks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Chưa có phản hồi nào</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
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
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
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

