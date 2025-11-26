import { useState, useEffect } from 'react';
import { X, Car, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { useGetAvailableVehiclesQuery } from '../../../api/dealerStaff/vehicleApi';
import { useAssignVehiclesMutation } from '../../../api/dealerStaff/orderApi';
import { useToast } from '../../../components/ui/Toast';

/**
 * Vehicle Assignment Modal
 * Allows staff to assign specific vehicles (with VIN) to order details
 * Shows available vehicles for each product line in the order
 */
const VehicleAssignmentModal = ({ isOpen, onClose, order, orderDetails }) => {
    const toast = useToast();
    const [assignments, setAssignments] = useState({});
    const [assignVehicles, { isLoading: isAssigning }] = useAssignVehiclesMutation();

    // Reset assignments when modal opens with new order
    useEffect(() => {
        if (isOpen && orderDetails) {
            const initialAssignments = {};
            orderDetails.forEach(detail => {
                // If vehicle is already assigned, pre-select it
                if (detail.vehicleId) {
                    initialAssignments[detail.orderDetailId] = detail.vehicleId;
                }
            });
            setAssignments(initialAssignments);
        }
    }, [isOpen, orderDetails]);

    const handleAssignVehicle = (orderDetailId, vehicleId) => {
        setAssignments(prev => ({
            ...prev,
            [orderDetailId]: vehicleId,
        }));
    };

    const handleSubmit = async () => {
        if (!orderDetails || orderDetails.length === 0) {
            toast.error('Không có sản phẩm trong đơn hàng');
            return;
        }

        // Check if all order details have assigned vehicles
        const unassignedDetails = orderDetails.filter(
            detail => !assignments[detail.orderDetailId]
        );

        if (unassignedDetails.length > 0) {
            toast.error(`Vui lòng gán xe cho tất cả ${orderDetails.length} sản phẩm`);
            return;
        }

        try {
            // Format assignments for API
            const assignmentPayload = orderDetails.map(detail => ({
                orderDetailId: detail.orderDetailId,
                vehicleId: assignments[detail.orderDetailId],
            }));

            await assignVehicles(assignmentPayload).unwrap();
            toast.success('Đã gán xe thành công!');
            onClose();
        } catch (error) {
            console.error('Error assigning vehicles:', error);
            toast.error(error?.data?.message || 'Có lỗi xảy ra khi gán xe');
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
            <div className="bg-white rounded-xl shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Gán xe cho đơn hàng</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Mã đơn: <span className="font-medium text-blue-600">{order?.orderCode}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
                    {!orderDetails || orderDetails.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
                            <p>Không có sản phẩm trong đơn hàng</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orderDetails.map((detail, index) => (
                                <OrderDetailVehicleAssignment
                                    key={detail.orderDetailId}
                                    detail={detail}
                                    index={index}
                                    selectedVehicleId={assignments[detail.orderDetailId]}
                                    onSelectVehicle={(vehicleId) => handleAssignVehicle(detail.orderDetailId, vehicleId)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        {orderDetails && orderDetails.length > 0 && (
                            <>
                                Đã gán: <span className="font-semibold text-slate-900">
                                    {Object.keys(assignments).length}
                                </span> / {orderDetails.length}
                            </>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isAssigning}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isAssigning || !orderDetails || orderDetails.length === 0}
                            className="min-w-[120px]"
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Đang gán...
                                </>
                            ) : (
                                'Xác nhận gán xe'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Component for assigning vehicle to a single order detail
 */
const OrderDetailVehicleAssignment = ({ detail, index, selectedVehicleId, onSelectVehicle }) => {
    const { data: vehiclesData, isLoading, error } = useGetAvailableVehiclesQuery(
        {
            modelId: detail.modelId,
            colorId: detail.colorId,
        },
        {
            skip: !detail.modelId || !detail.colorId,
        }
    );

    const vehicles = Array.isArray(vehiclesData?.data) ? vehiclesData.data : [];

    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            {/* Product Info */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{detail.modelName}</h3>
                        <p className="text-sm text-slate-500">
                            Màu: {detail.colorName} • Số lượng: {detail.quantity}
                        </p>
                    </div>
                </div>
                {selectedVehicleId && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle2 size={16} />
                        Đã chọn
                    </div>
                )}
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                    Chọn xe (VIN) <span className="text-red-500">*</span>
                </label>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                        <Loader2 size={24} className="animate-spin mr-2" />
                        Đang tải danh sách xe...
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                        <AlertCircle size={16} className="inline mr-2" />
                        Không thể tải danh sách xe. Vui lòng thử lại.
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                        <AlertCircle size={16} className="inline mr-2" />
                        Không có xe khả dụng cho model và màu này
                    </div>
                ) : (
                    <select
                        value={selectedVehicleId || ''}
                        onChange={(e) => onSelectVehicle(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn xe --</option>
                        {vehicles.map((vehicle) => (
                            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                VIN: {vehicle.vin} {vehicle.importDate && `• Nhập: ${new Date(vehicle.importDate).toLocaleDateString('vi-VN')}`}
                            </option>
                        ))}
                    </select>
                )}

                {/* Additional vehicle info if selected */}
                {selectedVehicleId && vehicles.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                            <Car size={16} />
                            <span className="font-medium">Thông tin xe đã chọn:</span>
                        </div>
                        {(() => {
                            const selectedVehicle = vehicles.find(v => v.vehicleId === parseInt(selectedVehicleId));
                            if (!selectedVehicle) return null;
                            return (
                                <ul className="mt-2 text-sm text-blue-900 space-y-1">
                                    <li>• VIN: <span className="font-mono">{selectedVehicle.vin}</span></li>
                                    {selectedVehicle.importDate && (
                                        <li>• Ngày nhập: {new Date(selectedVehicle.importDate).toLocaleDateString('vi-VN')}</li>
                                    )}
                                    {selectedVehicle.status && (
                                        <li>• Trạng thái: {selectedVehicle.status}</li>
                                    )}
                                </ul>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleAssignmentModal;
