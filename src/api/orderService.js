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

// Create order
export async function createOrder(orderData) {
    return request('/api/orders/create', {
        method: 'POST',
        body: {
            customerId: orderData.customerId
        }
    });
}

// Get all orders
export async function getAllOrders() {
    return request('/api/orders/all', { method: 'GET' });
}

// Get order by ID
export async function getOrderById(orderId) {
    return request(`/api/orders/${orderId}`, { method: 'GET' });
}

// Update order
export async function updateOrder(orderId, orderData) {
    return request(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: orderData
    });
}

// Update order status
export async function updateOrderStatus(orderId, status) {
    return request(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status }
    });
}

// Delete order
export async function deleteOrder(orderId) {
    return request(`/api/orders/delete/${orderId}`, { method: 'DELETE' });
}