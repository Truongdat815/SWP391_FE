import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = {};
    
    // Only set Content-Type for requests with body (POST, PUT, PATCH)
    // DELETE requests typically don't have body, so don't set Content-Type
    if (body) {
        headers['Content-Type'] = 'application/json';
    }
    
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

export async function createCustomer(customer) {
    return request('/api/customers/create', { method: 'POST', body: { customerId: 0, ...customer } });
}

export async function updateCustomer({ customerId, ...customer }) {
    return request(`/api/customers/update/${encodeURIComponent(customerId)}`, { method: 'PUT', body: customer });
}

export async function getCustomerById(id) {
    return request(`/api/customers/id/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function getAllCustomers() {
    return request('/api/customers/all', { method: 'GET' });
}

export async function getCustomersByStore(storeId) {
    return request(`/api/customers/store/${encodeURIComponent(storeId)}`, { method: 'GET' });
}

export async function deleteCustomer(customerId) {
    // Ensure customerId is a valid number or string
    if (customerId === null || customerId === undefined) {
        throw new Error('Customer ID is required');
    }
    const id = typeof customerId === 'number' ? customerId : parseInt(customerId);
    if (isNaN(id)) {
        throw new Error('Invalid customer ID');
    }
    // Backend endpoint: /api/customers/delete/{customerId}
    try {
        return await request(`/api/customers/delete/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (error) {
        // Check if error is related to foreign key constraint
        const errorMessage = error.message || error.toString();
        if (errorMessage.includes('REFERENCE constraint') || errorMessage.includes('FK') || errorMessage.includes('contracts')) {
            throw new Error('Không thể xóa khách hàng này vì có đơn hàng đã được tạo hợp đồng. Vui lòng xóa hoặc hủy các hợp đồng liên quan trước khi xóa khách hàng.');
        }
        throw error;
    }
}