import { API_URL, buildUrl } from './client';

const getToken = () => sessionStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = buildUrl(API_URL, path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`🌐 API Request: ${method} ${url}`, body ? { body } : '');

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    console.log(`📥 API Response: ${method} ${url}`, { status: res.status, data });
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        console.error(`❌ API Error: ${method} ${url}`, { status: res.status, message, data });
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
    try {
        return await request('/api/orders/all', { method: 'GET' });
    } catch (err) {
        if (err.status === 404) {
            console.warn('Orders endpoint not found, returning empty data');
            return { data: [] };
        }
        throw err;
    }
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

// Get orders by status (draft, confirmed)
export async function getOrdersByStatus(status) {
    return request(`/api/orders/status/${status}`, { method: 'GET' });
}

// Get orders by date range
export async function getOrdersByDateRange(startDate, endDate) {
    // Format: /api/orders/date-range?startDate=2024-01-01&endDate=2024-12-31
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/api/orders/date-range?${params.toString()}`, { method: 'GET' });
}

// Get orders by customer
export async function getOrdersByCustomer(customerId) {
    return request(`/api/orders/customer/${customerId}`, { method: 'GET' });
}

// Get orders by staff ID
export async function getOrdersByStaffId(staffId) {
    return request(`/api/orders/staff/${staffId}`, { method: 'GET' });
}

// Get staff order statistics (total orders and monthly revenue)
export async function getStaffOrderStats(staffId) {
    return request(`/api/orders/staff/${staffId}`, { method: 'GET' });
}

// Confirm order (DRAFT → CONFIRMED)
export async function confirmOrder(orderId) {
    return request(`/api/orders/${orderId}/confirm`, {
        method: 'PUT',
        body: { orderId: orderId }
    });
}

// Deliver order (set status to DELIVERED)
export async function deliverOrder(orderId) {
    return request(`/api/orders/${orderId}/deliver`, {
        method: 'PUT'
    });
}