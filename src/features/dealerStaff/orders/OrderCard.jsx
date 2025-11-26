import { formatCurrency, formatDate, getOrderStatusConfig, isPaymentRequired } from '../../../utils/formatters';
import { User, Phone, Calendar, FileText, Eye, Truck, DollarSign } from 'lucide-react';

const OrderCard = ({ order, contracts = [], onView, onCreateContract, onViewContract, onDeliverOrder, onCreateDepositRequest, onConfirmDepositPayment }) => {
  // Helper function to check if contract has been uploaded
  const hasUploadedContract = (contract) => {
    if (!contract) return false;
    const signedContractFileUrl = contract?.contractFileUrl || contract?.signedContractFileUrl;
    return signedContractFileUrl &&
      typeof signedContractFileUrl === 'string' &&
      signedContractFileUrl.trim().length > 0;
  };

  // Helper function to get effective order status considering contract
  const getEffectiveOrderStatus = (order) => {
    // If order already has FULLY_PAID status, return it
    if (order.status === 'FULLY_PAID' || order.status === 'DELIVERED') {
      return order.status;
    }

    // Check if order has a contract with totalPayment = 0 AND contract has been uploaded
    if (order.contractId) {
      const contract = contracts.find(c => c.contractId === order.contractId);
      if (contract && !isPaymentRequired(contract.totalPayment) && hasUploadedContract(contract)) {
        // Contract has totalPayment <= 5 AND has been uploaded, consider as FULLY_PAID
        return 'FULLY_PAID';
      }
    }

    return order.status;
  };

  const effectiveStatus = getEffectiveOrderStatus(order);
  const statusConfig = getOrderStatusConfig(effectiveStatus);

  const canCreateContract = order.status === 'DEPOSIT_PAID';
  const hasContract = order.contractId && order.contractId > 0;

  const handleContractClick = () => {
    if (hasContract) {
      // Check if contract has been uploaded
      const contract = contracts.find(c => c.contractId === order.contractId);
      if (contract) {
        const signedContractFileUrl = contract?.contractFileUrl || contract?.signedContractFileUrl;
        // If contract has been uploaded, open fileUrl directly
        if (signedContractFileUrl &&
          typeof signedContractFileUrl === 'string' &&
          signedContractFileUrl.trim().length > 0) {
          window.open(signedContractFileUrl, '_blank');
          return;
        }
      }
      // If no fileUrl, open contract view page
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
              if (effectiveStatus === 'FULLY_PAID' && onDeliverOrder) {
                onDeliverOrder(order);
              }
            }}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${effectiveStatus === 'FULLY_PAID'
              ? 'hover:bg-green-50 text-green-600'
              : 'text-transparent cursor-default'
              }`}
            title={effectiveStatus === 'FULLY_PAID' ? 'Giao hàng' : ''}
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
        ) : order.status === 'CONFIRMED' ? (
          <button
            onClick={() => onCreateDepositRequest && onCreateDepositRequest(order)}
            className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20"
          >
            <FileText size={16} />
            Tạo đặt cọc
          </button>
        ) : order.status === 'PENDING_DEPOSIT' ? (
          <button
            onClick={() => onConfirmDepositPayment && onConfirmDepositPayment(order)}
            className="w-full px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-green-500/20"
          >
            <DollarSign size={16} />
            Xác nhận cọc
          </button>
        ) : (
          <button
            onClick={handleContractClick}
            disabled={!canCreateContract}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${canCreateContract
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
