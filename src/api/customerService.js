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
    return request(`/api/customers/delete/${encodeURIComponent(customerId)}`, { method: 'DELETE' });
}