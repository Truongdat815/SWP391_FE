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

// Models CRUD
export async function getAllModels() {
    return request('/api/models/all', { method: 'GET' });
}

export async function getModelById(modelId) {
    return request(`/api/models/${encodeURIComponent(modelId)}`, { method: 'GET' });
}

export async function createModel(model) {
    return request('/api/models/create', { method: 'POST', body: model });
}

export async function updateModel(modelData) {
    const { modelId } = modelData;
    return request(`/api/models/${encodeURIComponent(modelId)}`, { method: 'PUT', body: modelData });
}

export async function deleteModel(modelId) {
    return request(`/api/models/${encodeURIComponent(modelId)}`, { method: 'DELETE' });
}

// Relations & queries
export async function getColorsByModelName(modelName) {
    return request(`/api/models/${encodeURIComponent(modelName)}/colors`, { method: 'GET' });
}

export async function getModelsByColorName(colorName) {
    return request(`/api/models/color/${encodeURIComponent(colorName)}/models`, { method: 'GET' });
}

// Model-Color relation
export async function addColorToModel(payload) {
    // payload: { modelName, colorName }
    return request('/api/model-colors/create', { method: 'POST', body: payload });
}

export async function removeColorFromModel(payload) {
    // payload: { modelName, colorName }
    const { modelName, colorName } = payload;
    return request(`/api/model-colors/delete?modelName=${encodeURIComponent(modelName)}&colorName=${encodeURIComponent(colorName)}`, { method: 'DELETE' });
}


