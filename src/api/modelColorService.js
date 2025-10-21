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
    try {
        return await request('/api/model-colors', { method: 'GET' });
    } catch (e) {
        // If not available, return an empty structure to avoid 404 crash on FE
        return { data: [] };
    }
}

export async function createModelColor(payload) {
    // payload: { modelId: number, colorId: number, imagePath: string }
    return request('/api/model-colors/create', { method: 'POST', body: payload });
}

export async function updateModelColor(payload) {
    // payload: { modelId: number, colorId: number, imagePath: string }
    return request('/api/model-colors/update', { method: 'PUT', body: payload });
}

export async function deleteModelColor(modelId, colorId) {
    return request(`/api/model-colors/delete?modelId=${encodeURIComponent(modelId)}&colorId=${encodeURIComponent(colorId)}`, { method: 'DELETE' });
}

export async function getColorsByModelId(modelId) {
    return request(`/api/models/${encodeURIComponent(modelId)}/colors`, { method: 'GET' });
}


