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
    return request('/api/model-colors/all', { method: 'GET' });
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
    const response = await request('/api/model-colors/create', { 
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

// Upload model color image
export async function uploadModelColorImage(modelId, colorId, file) {
    const token = getToken();
    const url = `${API_URL}/api/model-colors/${encodeURIComponent(modelId)}/${encodeURIComponent(colorId)}/upload-model-color-image`;
    
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
        // Try to extract error message from different response formats
        let message = 'Request failed';
        
        if (isJson) {
            // Check for nested error messages
            message = data?.message || 
                     data?.error || 
                     data?.errorMessage || 
                     (typeof data === 'string' ? data : JSON.stringify(data));
        } else if (typeof data === 'string') {
            message = data;
        }
        
        // If no message found, use status text
        if (!message || message === 'Request failed') {
            message = res.statusText || 'Request failed';
        }
        
        // Include full error details for debugging
        const error = new Error(message);
        error.status = res.status;
        error.response = data;
        throw error;
    }
    
    return data;
}
