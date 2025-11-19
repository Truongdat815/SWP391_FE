import { API_URL, buildUrl } from './client';

const getToken = () => sessionStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = buildUrl(API_URL, path);
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
        const error = new Error(message);
        error.status = res.status;
        error.code = isJson && data?.code ? data.code : null;
        error.data = data;
        throw error;
    }
    return data;
}

// Inventory Transactions API
export async function getAllTransactions(options = {}) {
    try {
        return await request('/api/inventory-transactions/all', { method: 'GET' });
    } catch (err) {
        // Silently handle 404 errors - endpoint may not exist for admin users
        if (err.status === 404) {
            return { data: [] };
        }
        throw err;
    }
}

export async function getTransactionsByStoreStock(storeStockId) {
    return request(`/api/inventory-transactions/store-stock/${encodeURIComponent(storeStockId)}`, { method: 'GET' });
}

export async function getTransactionById(inventoryId) {
    return request(`/api/inventory-transactions/${encodeURIComponent(inventoryId)}`, { method: 'GET' });
}

export async function getTransactionsByDateRange(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return request(`/api/inventory-transactions/date-range${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
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

export async function acceptTransaction(inventoryId) {
    return request(`/api/inventory-transactions/accept/${encodeURIComponent(inventoryId)}`, { method: 'PUT' });
}

export async function rejectTransaction(inventoryId) {
    return request(`/api/inventory-transactions/reject/${encodeURIComponent(inventoryId)}`, { method: 'PUT' });
}

export async function startShippingTransaction(inventoryId) {
    return request(`/api/inventory-transactions/start-shipping/${encodeURIComponent(inventoryId)}`, { method: 'PUT' });
}

export async function confirmDeliveryTransaction(inventoryId) {
    return request(`/api/inventory-transactions/confirm-delivery/${encodeURIComponent(inventoryId)}`, { method: 'PUT' });
}

export async function confirmPaymentTransaction(inventoryId) {
    return request(`/api/inventory-transactions/${encodeURIComponent(inventoryId)}/confirm-payment`, { method: 'PUT' });
}

export async function uploadReceipt(inventoryId, file) {
    const token = getToken();
    const url = buildUrl(API_URL, `/api/inventory-transactions/${encodeURIComponent(inventoryId)}/upload-receipt`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Don't set Content-Type, let browser set it for multipart/form-data
    
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });
    
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
        // Try to extract error message from different response formats
        let message = 'Upload failed';
        
        if (isJson) {
            // Check for nested error messages
            message = data?.message || 
                     data?.error || 
                     data?.errorMessage || 
                     (typeof data === 'string' ? data : JSON.stringify(data));
            
            // Handle specific database errors
            if (message.includes('Query did not return a unique result') || 
                message.includes('8 results were returned')) {
                message = 'Lỗi database: Tìm thấy nhiều bản ghi trùng lặp với ID này. Vui lòng liên hệ admin để kiểm tra database.';
            }
        } else if (typeof data === 'string') {
            message = data;
        }
        
        // If no message found, use status text
        if (!message || message === 'Upload failed') {
            message = res.statusText || 'Upload failed';
        }
        
        // Include full error details for debugging
        const error = new Error(message);
        error.status = res.status;
        error.code = isJson && data?.code ? data.code : null;
        error.response = data;
        throw error;
    }
    
    return data;
}


