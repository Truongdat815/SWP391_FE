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

export async function createUser(user) {
    return request('/api/users/create', { method: 'POST', body: user });
}

export async function updateUser({ userId, ...user }) {
    return request(`/api/users/update/${encodeURIComponent(userId)}`, { method: 'PUT', body: user });
}

export async function getAllUsers() {
    try {
        return await request('/api/users/all', { method: 'GET' });
    } catch (err) {
        if (err.status === 404) {
            console.warn('Users endpoint not found, returning empty data');
            return { data: [] };
        }
        throw err;
    }
}

export async function deleteUser(userId) {
    return request(`/api/users/delete/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}

export async function getCurrentUser() {
    return request('/api/users/me', { method: 'GET' });
}

export async function updateUserStatus(userId, status) {
    return request(`/api/users/${encodeURIComponent(userId)}/status`, { method: 'PUT', body: { status } });
}


