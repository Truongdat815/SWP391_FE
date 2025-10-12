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

export async function getStoreById(storeId) {
    return request(`/api/stores/${encodeURIComponent(storeId)}`, { method: 'GET' });
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
// tìm và filter cửa hàng
export async function getStoresByStoreName(storeName) {
    return request(`/api/stores/${encodeURIComponent(storeName)}`, { method: 'GET' });
}

export async function getStoresByStatus(status) {
    return request(`/api/stores/status/${encodeURIComponent(status)}`, { method: 'GET' });
}

export async function getStoresByProvince(provinceName) {
    return request(`/api/stores/province/${encodeURIComponent(provinceName)}`, { method: 'GET' });
}

export async function searchStores({ storeName, provinceName, ownerName }) {
    const params = new URLSearchParams();
    if (storeName) params.append('storeName', storeName);
    if (provinceName) params.append('provinceName', provinceName);
    if (ownerName) params.append('ownerName', ownerName);

    const queryString = params.toString();
    return request(`/api/stores/search${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
}
