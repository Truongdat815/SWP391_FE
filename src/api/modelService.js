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
        throw new Error(message);
    }
    return data;
}

// Models CRUD
export async function getAllModels() {
    try {
        return await request('/api/models/all', { method: 'GET' });
    } catch (err) {
        if (err.status === 404) {
            console.warn('Models endpoint not found, returning empty data');
            return { data: [] };
        }
        throw err;
    }
}

export async function getModelById(modelId) {
    // Backend may not support /api/models/{id}, fetch all and filter
    const allModels = await getAllModels();
    const model = allModels.find(m => m.modelId === modelId);
    if (!model) {
        throw new Error(`Model with ID ${modelId} not found`);
    }
    return model;
}

export async function createModel(model) {
    const response = await request('/api/models/create', { method: 'POST', body: model });
    // Backend returns { code, message, data: { ... } }
    return response?.data || response;
}

export async function updateModel(modelData) {
    const { modelId } = modelData;
    return request(`/api/models/update/${encodeURIComponent(modelId)}`, { method: 'PUT', body: modelData });
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



