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

export async function getAllModelColors() {
    return request('/api/model-colors', { method: 'GET' });
}

export async function createModelColor(payload) {
    // payload: { modelColorId?, modelName, colorName, quantity? }
    return request('/api/model-colors/create', { method: 'POST', body: payload });
}

export async function updateModelColor(payload) {
    const { modelColorId } = payload;
    return request(`/api/model-colors/update/${encodeURIComponent(modelColorId)}`, { method: 'PUT', body: payload });
}

export async function deleteModelColor(modelColorId) {
    return request(`/api/model-colors/delete/${encodeURIComponent(modelColorId)}`, { method: 'DELETE' });
}


