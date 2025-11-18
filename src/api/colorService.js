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

// Colors CRUD
export async function getAllColors() {
    try {
        return await request('/api/colors/all', { method: 'GET' });
    } catch (err) {
        if (err.status === 404) {
            console.warn('Colors endpoint not found, returning empty data');
            return { data: [] };
        }
        throw err;
    }
}

export async function createColor(color) {
    return request('/api/colors/create', { method: 'POST', body: color });
}

export async function updateColor(colorData) {
    const { colorId } = colorData;
    return request(`/api/colors/update/${encodeURIComponent(colorId)}`, { method: 'PUT', body: colorData });
}

export async function deleteColor(colorId) {
    return request(`/api/colors/delete/${encodeURIComponent(colorId)}`, { method: 'DELETE' });
}


