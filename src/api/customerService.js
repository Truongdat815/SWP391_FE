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

// Create customer
export async function createCustomer(customerData) {
    return request('/api/customers/create', {
        method: 'POST',
        body: {
            customerId: 0,
            fullName: customerData.fullName,
            address: customerData.address,
            email: customerData.email,
            phone: customerData.phone
        }
    });
}

// Get all customers
export async function getAllCustomers() {
    return request('/api/customers/all', { method: 'GET' });
}

// Get customer by ID
export async function getCustomerById(customerId) {
    return request(`/api/customers/${customerId}`, { method: 'GET' });
}

// Update customer
export async function updateCustomer(customerId, customerData) {
    return request(`/api/customers/${customerId}`, {
        method: 'PUT',
        body: customerData
    });
}

// Delete customer
export async function deleteCustomer(customerId) {
    return request(`/api/customers/${customerId}`, { method: 'DELETE' });
}