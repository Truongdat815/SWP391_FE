import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, CheckCircle, XCircle, FileText, Package, DollarSign } from 'lucide-react';
import OrderStatusStepper from './OrderStatusStepper';
import ModernButton from './ModernButton';

const PaymentReviewModal = ({ 
  show, 
  transaction, 
  storeStock,
  onConfirm, 
  onReject, 
  onClose 
}) => {
  const [imageZoom, setImageZoom] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!show || !transaction) return null;

  const receiptUrl = transaction.imageUrl || transaction.receiptUrl;
  const isImage = receiptUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(receiptUrl);
  const isPdf = receiptUrl && /\.pdf$/i.test(receiptUrl);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(transaction);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(transaction);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDownload = () => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="w-7 h-7" />
                    Xác nhận thanh toán
                  </h2>
                  <p className="text-teal-100 mt-1">
                    Đơn hàng #{transaction.inventoryId || transaction.id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Timeline */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Tiến trình đơn hàng
                </h3>
                <OrderStatusStepper currentStatus={transaction.status} size="sm" />
              </div>

              {/* Order Details */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Thông tin đơn hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Model • Màu sắc</p>
                    <p className="text-sm font-bold text-gray-900">
                      {storeStock ? `${storeStock.modelName} • ${storeStock.colorName}` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Cửa hàng</p>
                    <p className="text-sm font-bold text-gray-900">
                      {storeStock?.storeName || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Số lượng</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {transaction.importQuantity} xe
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Ngày đặt hàng</p>
                    <p className="text-sm font-bold text-gray-900">
                      {transaction.orderDate 
                        ? new Date(transaction.orderDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {transaction.totalPrice > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Chi tiết giá
                  </h3>
                  <div className="space-y-3">
                    {transaction.unitBasePrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Đơn giá cơ bản:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(transaction.unitBasePrice)} VNĐ
                        </span>
                      </div>
                    )}
                    {transaction.totalBasePrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng cơ bản ({transaction.importQuantity} xe):</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(transaction.totalBasePrice)} VNĐ
                        </span>
                      </div>
                    )}
                    {transaction.discountPercentage > 0 && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span className="text-sm">Giảm giá ({transaction.discountPercentage}%):</span>
                        <span className="text-sm font-medium">
                          -{formatPrice(transaction.discountAmount)} VNĐ
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-emerald-200 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Tổng thanh toán:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatPrice(transaction.totalPrice)} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Receipt Preview */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Biên lai thanh toán
                  </h3>
                  {receiptUrl && (
                    <div className="flex items-center gap-2">
                      {isImage && (
                        <>
                          <button
                            onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors"
                            title="Zoom out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors"
                            title="Zoom in"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleDownload}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        title="Download receipt"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Tải xuống</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-inner min-h-[400px] flex items-center justify-center overflow-auto">
                  {receiptUrl ? (
                    isImage ? (
                      <motion.img
                        src={receiptUrl}
                        alt="Receipt"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ transform: `scale(${imageZoom})` }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : isPdf ? (
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 text-amber-600 mx-auto" />
                        <p className="text-gray-700 font-medium">File PDF</p>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Xem PDF
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Định dạng file không được hỗ trợ xem trước</p>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Tải xuống để xem
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-400">
                      <FileText className="w-16 h-16 mx-auto mb-2" />
                      <p>Không có biên lai</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <ModernButton
                  onClick={onClose}
                  variant="secondary"
                  size="md"
                  disabled={isConfirming || isRejecting}
                >
                  Đóng
                </ModernButton>
                <ModernButton
                  onClick={handleReject}
                  variant="danger"
                  size="md"
                  icon={<XCircle className="w-5 h-5" />}
                  loading={isRejecting}
                  disabled={isConfirming}
                >
                  Từ chối thanh toán
                </ModernButton>
                <ModernButton
                  onClick={handleConfirm}
                  variant="success"
                  size="md"
                  icon={<CheckCircle className="w-5 h-5" />}
                  loading={isConfirming}
                  disabled={isRejecting}
                >
                  Xác nhận thanh toán
                </ModernButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentReviewModal;

