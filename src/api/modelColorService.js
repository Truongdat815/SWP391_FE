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

// Get all model-color combinations
export async function getAllModelColors() {
    return request('/api/model-colors', { method: 'GET' });
}

// Get by ID
export async function getModelColorById(id) {
    return request(`/api/model-colors/${encodeURIComponent(id)}`, { method: 'GET' });
}

// Get by Model ID
export async function getModelColorsByModelId(modelId) {
    return request(`/api/model-colors/model/${encodeURIComponent(modelId)}`, { method: 'GET' });
}

// Get by Color ID
export async function getModelColorsByColorId(colorId) {
    return request(`/api/model-colors/color/${encodeURIComponent(colorId)}`, { method: 'GET' });
}

// Create new model-color combination
export async function createModelColor(data) {
    const response = await request('/api/model-colors', { 
        method: 'POST', 
        body: data 
    });
    // Backend returns { code, message, data: { ... } }
    return response?.data || response;
}

// Update model-color combination
export async function updateModelColor(id, data) {
    return request(`/api/model-colors/${encodeURIComponent(id)}`, { 
        method: 'PUT', 
        body: data 
    });
}

// Delete model-color combination
export async function deleteModelColor(id) {
    return request(`/api/model-colors/${encodeURIComponent(id)}`, { 
        method: 'DELETE' 
    });
}
