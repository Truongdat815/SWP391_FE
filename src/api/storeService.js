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

export async function updateStore({ storeId, ...store }) {
    return request(`/api/stores/update/${encodeURIComponent(storeId)}`, { method: 'PUT', body: store });
}

export async function deleteStore(storeId) {
    return request(`/api/stores/delete/${encodeURIComponent(storeId)}`, { method: 'DELETE' });
}
