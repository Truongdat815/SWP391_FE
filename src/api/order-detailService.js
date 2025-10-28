import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`🌐 API Request (Order Details): ${method} ${url}`, body ? { body } : '');

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    console.log(`📥 API Response (Order Details): ${method} ${url}`, { status: res.status, data });
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        console.error(`❌ API Error (Order Details): ${method} ${url}`, { status: res.status, message, data });
        throw new Error(message);
    }
    return data;
}

// Create order detail - Match Swagger API schema
// Expected body: { orderId: number, orderDetails: [{ modelId, colorId, quantity, promotionId }] }
export async function createOrderDetail(orderDetailData) {
    return request('/api/order-details/create', {
        method: 'POST',
        body: {
            orderId: orderDetailData.orderId,
            orderDetails: orderDetailData.orderDetails
        }
    });
}

// Validate order detail before creating
export async function validateOrderDetail(orderDetailData) {
    return request('/api/order-details/validate', {
        method: 'POST',
        body: orderDetailData
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