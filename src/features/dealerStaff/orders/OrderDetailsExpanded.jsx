import { formatCurrency, formatDate, getOrderStatusConfig } from '../../../utils/formatters';
import { 
  User, FileText, Car, Building, Store
} from 'lucide-react';

const OrderDetailsExpanded = ({ order, onViewContract }) => {
  if (!order) return null;

  const statusConfig = getOrderStatusConfig(order.status);

  return (
    <div className="space-y-4">
      {/* Header Section - Order Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">#{order.orderCode}</h3>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-slate-600">{formatDate(order.orderDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Tổng thanh toán</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(order.totalPayment)}</p>
          </div>
        </div>
      </div>

      {/* Compact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            Khách hàng
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Họ tên</p>
              <p className="text-sm font-medium text-slate-900">{order.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Số điện thoại</p>
              <p className="text-sm text-slate-700">{order.customerPhone || 'N/A'}</p>
            </div>
           
          </div>
        </div>

        {/* Store & Staff Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Building size={16} className="text-green-600" />
            Cửa hàng & Nhân viên
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Cửa hàng</p>
              <p className="text-sm font-medium text-slate-900">{order.storeName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Nhân viên</p>
              <p className="text-sm text-slate-700">{order.staffName || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <FileText size={16} className="text-purple-600" />
          Hợp đồng
        </h4>
        {(order.contractId && order.contractId > 0) ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">#{order.contractCode}</p>
            <button
              onClick={() => onViewContract && onViewContract(order.contractId)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Xem chi tiết
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <p className="text-sm text-slate-500 italic">Chưa có</p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Car size={16} className="text-indigo-600" />
            Sản phẩm đã đặt
          </h4>
        </div>
        
        <div className="p-4 space-y-3">
          {order.getOrderDetailsResponses?.map((detail, idx) => (
            <div key={detail.orderDetailId || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Car size={16} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{detail.modelName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full border border-slate-300" style={{backgroundColor: detail.colorName?.toLowerCase()}}></div>
                    <span className="text-xs text-slate-600">{detail.colorName}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">SL: {detail.quantity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{formatCurrency(detail.totalPrice)}</p>
                {detail.promotionName && detail.discountAmount > 0 && (
                  <p className="text-xs text-green-600">-{formatCurrency(detail.discountAmount)}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Pricing Details */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            {/* Total Tax Price */}
            {order.totalTaxPrice > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tổng thuế:</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(order.totalTaxPrice)}</span>
              </div>
            )}
            
            {/* Total Price (before discount) */}
            {order.totalPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tổng tiền hàng:</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(order.totalPrice)}</span>
              </div>
            )}
            
            {/* Total Promotion Amount */}
            {order.totalPromotionAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tổng giảm giá:</span>
                <span className="text-sm font-medium text-green-600">-{formatCurrency(order.totalPromotionAmount)}</span>
              </div>
            )}
            
            {/* Total Payment */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-900">Tổng thanh toán:</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(order.totalPayment)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsExpanded;
