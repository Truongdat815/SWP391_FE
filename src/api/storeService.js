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

export async function getAllStores() {
    return request('/api/stores/all', { method: 'GET' });
}

export async function getStoreByName(storeName) {
    return request(`/api/stores/${encodeURIComponent(storeName)}`, { method: 'GET' });
}

export async function createStore(store) {
    return request('/api/stores/create', { method: 'POST', body: store });
}

export async function updateStore(storeData) {
    const { storeId, ...store } = storeData;
    return request(`/api/stores/update/${encodeURIComponent(storeId)}`, { method: 'PUT', body: storeData });
}

export async function deleteStore(storeId) {
    return request(`/api/stores/delete/${encodeURIComponent(storeId)}`, { method: 'DELETE' });
}
export async function getStoresByStatus(status) {
    return request(`/api/stores/status/${encodeURIComponent(status)}`, { method: 'GET' });
}

export async function uploadStoreImage(storeId, file) {
    const token = getToken();
    const url = `${API_URL}/api/stores/${encodeURIComponent(storeId)}/upload-image`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Không set Content-Type, browser sẽ tự động set với boundary cho multipart/form-data
    
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });
    
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        throw new Error(message);
    }
    return data;
}