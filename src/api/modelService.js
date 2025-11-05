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

// Seed demo data function
export async function seedDemoData() {
    try {
        const { DEMO_MODELS_DATA } = await import('../utils/modelHelpers');
        const results = [];
        
        for (const modelData of DEMO_MODELS_DATA) {
            try {
                const result = await createModel(modelData);
                results.push({ success: true, model: modelData.modelName, data: result });
            } catch (error) {
                results.push({ 
                    success: false, 
                    model: modelData.modelName, 
                    error: error.message 
                });
            }
        }
        
        return {
            success: true,
            results,
            total: DEMO_MODELS_DATA.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        };
    } catch (error) {
        throw new Error(`Failed to seed demo data: ${error.message}`);
    }
}

// Bulk operations
export async function bulkDeleteModels(modelIds) {
    try {
        const results = [];
        for (const modelId of modelIds) {
            try {
                await deleteModel(modelId);
                results.push({ success: true, modelId });
            } catch (error) {
                results.push({ success: false, modelId, error: error.message });
            }
        }
        return results;
    } catch (error) {
        throw new Error(`Bulk delete failed: ${error.message}`);
    }
}

// Enhanced error handling wrapper
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    
    throw lastError;
}


