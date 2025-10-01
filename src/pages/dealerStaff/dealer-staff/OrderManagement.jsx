import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const [orders, setOrders] = useState([
    {
      id: 'DH001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      vehicle: 'Electra Ascent',
      color: 'Đen Huyền Bí',
      totalAmount: 1200000000,
      deposit: 200000000,
      remainingAmount: 1000000000,
      status: 'confirmed',
      paymentMethod: 'installment',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-03-15',
      salesStaff: 'Trần Thị B',
      notes: 'Khách hàng yêu cầu giao xe tại nhà'
    },
    {
      id: 'DH002',
      customerName: 'Lê Văn C',
      customerPhone: '0907654321',
      vehicle: 'Electra CityLink',
      color: 'Trắng Ngọc Trai',
      totalAmount: 850000000,
      deposit: 150000000,
      remainingAmount: 700000000,
      status: 'processing',
      paymentMethod: 'bank_transfer',
      orderDate: '2024-01-08',
      expectedDelivery: '2024-02-28',
      salesStaff: 'Phạm Văn D',
      notes: ''
    },
    {
      id: 'DH003',
      customerName: 'Trần Thị E',
      customerPhone: '0912345678',
      vehicle: 'Electra Summit',
      color: 'Đỏ Lửa',
      totalAmount: 1680000000,
      deposit: 300000000,
      remainingAmount: 1380000000,
      status: 'delivered',
      paymentMethod: 'cash',
      orderDate: '2024-01-05',
      expectedDelivery: '2024-02-20',
      deliveredDate: '2024-02-18',
      salesStaff: 'Nguyễn Văn F',
      notes: 'Đã giao xe và hoàn tất thủ tục'
    },
    {
      id: 'DH004',
      customerName: 'Hoàng Văn G',
      customerPhone: '0908765432',
      vehicle: 'Electra Micro',
      color: 'Xanh Dương Đại Dương',
      totalAmount: 750000000,
      deposit: 100000000,
      remainingAmount: 650000000,
      status: 'pending',
      paymentMethod: 'installment',
      orderDate: '2024-01-12',
      expectedDelivery: '2024-03-20',
      salesStaff: 'Trần Thị B',
      notes: 'Chờ khách hàng hoàn thiện hồ sơ vay'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'installment': return 'Trả góp';
      case 'lease': return 'Thuê tài chính';
      default: return method;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = !searchTerm || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { 
        ...order, 
        status: newStatus,
        ...(newStatus === 'delivered' && { deliveredDate: new Date().toISOString().split('T')[0] })
      } : order
    ));
  };

  const deleteOrder = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      setOrders(prev => prev.filter(order => order.id !== id));
      setSelectedOrder(null);
    }
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản Lý Đơn Hàng</h1>
                <p className="text-sm text-gray-500">Theo dõi và xử lý các đơn hàng bán xe</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/dealer-staff/create-order')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Tạo đơn hàng mới
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-500">Tổng đơn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <div className="text-sm text-gray-500">Chờ xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.confirmed}</div>
              <div className="text-sm text-gray-500">Đã xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.processing}</div>
              <div className="text-sm text-gray-500">Đang xử lý</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.delivered}</div>
              <div className="text-sm text-gray-500">Đã giao</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'all', name: 'Tất cả', count: statusCounts.all },
              { id: 'pending', name: 'Chờ xác nhận', count: statusCounts.pending },
              { id: 'confirmed', name: 'Đã xác nhận', count: statusCounts.confirmed },
              { id: 'processing', name: 'Đang xử lý', count: statusCounts.processing },
              { id: 'delivered', name: 'Đã giao', count: statusCounts.delivered }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Order List */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Danh sách đơn hàng</h3>
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className={`p-6 cursor-pointer transition ${
                      selectedOrder?.id === order.id ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h4 className="text-lg font-semibold text-gray-900 mr-3">{order.id}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{order.totalAmount.toLocaleString()} VNĐ</div>
                        <div className="text-xs text-gray-500">Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Khách hàng:</div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-gray-500">{order.customerPhone}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Xe:</div>
                        <div className="font-medium text-gray-900">{order.vehicle}</div>
                        <div className="text-gray-500">Màu: {order.color}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Giao dự kiến: {new Date(order.expectedDelivery).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'confirmed');
                            }}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Xác nhận
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'processing');
                            }}
                            className="text-purple-600 hover:text-purple-900 text-xs"
                          >
                            Xử lý
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'delivered');
                            }}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Giao xe
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Không tìm thấy đơn hàng nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="w-80">
              <div className="bg-white rounded-lg shadow sticky top-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Chi tiết đơn hàng</h3>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Mã đơn hàng</div>
                    <div className="text-lg font-bold text-red-600">{selectedOrder.id}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Trạng thái</div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Khách hàng</div>
                    <div className="text-sm text-gray-600">
                      <div>{selectedOrder.customerName}</div>
                      <div>{selectedOrder.customerPhone}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Xe</div>
                    <div className="text-sm text-gray-600">
                      <div>{selectedOrder.vehicle}</div>
                      <div>Màu: {selectedOrder.color}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Thanh toán</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Tổng tiền:</span>
                        <span className="font-medium">{selectedOrder.totalAmount.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã đặt cọc:</span>
                        <span className="font-medium">{selectedOrder.deposit.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Còn lại:</span>
                        <span className="font-medium text-red-600">{selectedOrder.remainingAmount.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="text-xs">
                        Phương thức: {getPaymentMethodText(selectedOrder.paymentMethod)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Thời gian</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Ngày đặt: {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}</div>
                      <div>Dự kiến giao: {new Date(selectedOrder.expectedDelivery).toLocaleDateString('vi-VN')}</div>
                      {selectedOrder.deliveredDate && (
                        <div>Đã giao: {new Date(selectedOrder.deliveredDate).toLocaleDateString('vi-VN')}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Nhân viên phụ trách</div>
                    <div className="text-sm text-gray-600">{selectedOrder.salesStaff}</div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">Ghi chú</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4 border-t">
                    <button className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">
                      Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => deleteOrder(selectedOrder.id)}
                      className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;