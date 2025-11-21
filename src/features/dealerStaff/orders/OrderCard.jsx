import { formatCurrency, formatDate, getOrderStatusConfig } from '../../../utils/formatters';
import { User, Phone, Calendar, FileText, Eye, Truck } from 'lucide-react';

const OrderCard = ({ order, onView, onCreateContract, onViewContract, onDeliverOrder }) => {
  const statusConfig = getOrderStatusConfig(order.status);

  const canCreateContract = order.status === 'CONFIRMED' || order.status === 'APPROVED';
  const hasContract = order.contractId && order.contractId > 0;

  const handleContractClick = () => {
    if (hasContract) {
      // Open in new tab like contracts page
      const url = `/dealer-staff/contracts/${order.contractId}/view`;
      window.open(url, '_blank');
    } else if (canCreateContract) {
      onCreateContract(order);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-slate-900">#{order.orderCode || order.orderId}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-500 gap-1">
            <Calendar size={12} />
            <span>{formatDate(order.orderDate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(order)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors flex items-center justify-center"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          {/* Always render button but conditionally visible for alignment */}
          <button
            onClick={() => {
              if (order.status === 'FULLY_PAID' && onDeliverOrder) {
                onDeliverOrder(order);
              }
            }}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              order.status === 'FULLY_PAID'
                ? 'hover:bg-green-50 text-green-600'
                : 'text-transparent cursor-default'
            }`}
            title={order.status === 'FULLY_PAID' ? 'Giao hàng' : ''}
          >
            <Truck size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 space-y-4">
        {/* Customer */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-full text-blue-600 shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{order.customerName || 'N/A'}</p>
            <div className="flex items-center text-xs text-slate-500 gap-1 mt-0.5">
              <Phone size={10} />
              <span>{order.customerPhone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Products Summary */}
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 space-y-1">
          {order.getOrderDetailsResponses?.slice(0, 2).map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="truncate flex-1 pr-2">{detail.modelName}</span>
              <span className="text-slate-900 font-medium">x{detail.quantity}</span>
            </div>
          ))}
          {(order.getOrderDetailsResponses?.length || 0) > 2 && (
            <p className="text-xs text-slate-400 italic text-center pt-1">
              +{order.getOrderDetailsResponses.length - 2} sản phẩm khác
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs text-slate-500 font-medium uppercase">Tổng tiền</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(order.totalPayment || 0)}
          </span>
        </div>

        {hasContract ? (
          <button
            onClick={handleContractClick}
            className="w-full px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText size={16} />
            Hợp đồng
          </button>
        ) : (
          <button
            onClick={handleContractClick}
            disabled={!canCreateContract}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              canCreateContract
                ? 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileText size={16} />
            Tạo HĐ
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
