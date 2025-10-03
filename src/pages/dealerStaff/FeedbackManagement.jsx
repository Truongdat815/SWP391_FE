import { useState } from 'react';

function FeedbackManagement({ onBack }) {
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      orderNumber: 'HD-001',
      vehicleModel: 'Electra Ascent',
      category: 'service',
      rating: 4,
      content: 'Dịch vụ tư vấn rất tốt, nhân viên nhiệt tình. Tuy nhiên thời gian giao xe hơi chậm.',
      status: 'pending',
      createdAt: '2024-01-15',
      resolvedAt: null
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      orderNumber: 'HD-002',
      vehicleModel: 'Electra CityLink',
      category: 'product',
      rating: 5,
      content: 'Xe rất đẹp, chất lượng tốt. Hài lòng với sản phẩm và dịch vụ.',
      status: 'resolved',
      createdAt: '2024-01-10',
      resolvedAt: '2024-01-12'
    },
    {
      id: 3,
      customerName: 'Lê Văn C',
      orderNumber: 'HD-003',
      vehicleModel: 'Electra GrandTour',
      category: 'complaint',
      rating: 2,
      content: 'Xe có vấn đề về hệ thống điều hòa, cần được kiểm tra và sửa chữa.',
      status: 'in_progress',
      createdAt: '2024-01-20',
      resolvedAt: null
    }
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    resolution: '',
    notes: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      default: return status;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'service': return 'Dịch vụ';
      case 'product': return 'Sản phẩm';
      case 'complaint': return 'Khiếu nại';
      default: return category;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'product': return 'bg-green-100 text-green-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (selectedFeedback) {
      const updatedFeedbacks = feedbacks.map(feedback => {
        if (feedback.id === selectedFeedback.id) {
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
    }
  };

  const openResolveForm = (feedback) => {
    setSelectedFeedback(feedback);
    setShowResolveForm(true);
  };

  const updateFeedbackStatus = (feedbackId, newStatus) => {
    const updatedFeedbacks = feedbacks.map(feedback => {
      if (feedback.id === feedbackId) {
        return {
          ...feedback,
          status: newStatus
        };
      }
      return feedback;
    });
    setFeedbacks(updatedFeedbacks);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-yellow-50 rounded-lg p-6">
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

          <div className="bg-blue-50 rounded-lg p-6">
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

          <div className="bg-green-50 rounded-lg p-6">
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

          <div className="bg-gray-50 rounded-lg p-6">
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đánh dấu đã giải quyết
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feedbacks List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách phản hồi</h3>
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Chưa có phản hồi nào</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                      {feedback.status === 'pending' && (
                        <button
                          onClick={() => updateFeedbackStatus(feedback.id, 'in_progress')}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Bắt đầu xử lý
                        </button>
                      )}
                      {feedback.status === 'in_progress' && (
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
      </div>
    </div>
  );
}

export default FeedbackManagement;
