import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        throw new Error(message);
    }
    return data;
}

// Create order detail
export async function createOrderDetail(orderDetailData) {
    return request('/api/order-details/create', {
        method: 'POST',
        body: {
            id: orderDetailData.id || 0,
            unitPrice: orderDetailData.unitPrice,
            quantity: orderDetailData.quantity,
            vatAmount: orderDetailData.vatAmount,
            licensePlateFee: orderDetailData.licensePlateFee,
            registrationFee: orderDetailData.registrationFee,
            discountAmount: orderDetailData.discountAmount,
            totalPrice: orderDetailData.totalPrice,
            createdAt: orderDetailData.createdAt || new Date().toISOString(),
            updatedAt: orderDetailData.updatedAt || new Date().toISOString(),
            orderId: orderDetailData.orderId,
            promotionId: orderDetailData.promotionId,
            storeStockId: orderDetailData.storeStockId,
            modelName: orderDetailData.modelName,
            colorName: orderDetailData.colorName,
            modelPrice: orderDetailData.modelPrice,
            availableStock: orderDetailData.availableStock,
            orderStatus: orderDetailData.orderStatus,
            customerName: orderDetailData.customerName,
            customerPhone: orderDetailData.customerPhone,
            promotionName: orderDetailData.promotionName,
            promotionType: orderDetailData.promotionType,
            subtotal: orderDetailData.subtotal,
            totalFees: orderDetailData.totalFees,
            totalTax: orderDetailData.totalTax,
            priceBeforeDiscount: orderDetailData.priceBeforeDiscount,
            finalAmount: orderDetailData.finalAmount,
            displayText: orderDetailData.displayText,
            feeBreakdown: orderDetailData.feeBreakdown,
            priceBreakdown: orderDetailData.priceBreakdown
        }
    });
}

// Get all order details
export async function getAllOrderDetails() {
    return request('/api/order-details/all', { method: 'GET' });
}

// Get order details by order ID
export async function getOrderDetailsByOrderId(orderId) {
    return request(`/api/order-details/order/${orderId}`, { method: 'GET' });
}

// Get order detail by ID
export async function getOrderDetailById(orderDetailId) {
    return request(`/api/order-details/${orderDetailId}`, { method: 'GET' });
}

// Update order detail
export async function updateOrderDetail(orderDetailId, orderDetailData) {
    return request(`/api/order-details/${orderDetailId}`, {
        method: 'PUT',
        body: orderDetailData
    });
}

// Delete order detail
export async function deleteOrderDetail(orderDetailId) {
    return request(`/api/order-details/${orderDetailId}`, { method: 'DELETE' });
}