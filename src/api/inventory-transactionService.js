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

// Inventory Transactions API
export async function getAllTransactions() {
    return request('/api/inventory-transactions/all', { method: 'GET' });
}

export async function getTransactionsByStoreStock(storeStockId) {
    return request(`/api/inventory-transactions/store-stock/${encodeURIComponent(storeStockId)}`, { method: 'GET' });
}

export async function getTransactionById(inventoryId) {
    return request(`/api/inventory-transactions/${encodeURIComponent(inventoryId)}`, { method: 'GET' });
}

export async function createTransaction(payload) {
    // Backend example did not show status, but ERD indicates it exists; include if provided
    return request('/api/inventory-transactions/create', { method: 'POST', body: payload });
}

export async function updateTransaction(inventoryId, payload) {
    return request(`/api/inventory-transactions/update/${encodeURIComponent(inventoryId)}`, { method: 'PUT', body: payload });
}

export async function deleteTransaction(inventoryId) {
    return request(`/api/inventory-transactions/delete/${encodeURIComponent(inventoryId)}`, { method: 'DELETE' });
}


