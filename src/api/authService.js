import { API_URL } from './client';

const getToken = () => sessionStorage.getItem('access_token');

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

// Login API
export async function login(credentials) {
    return request('/api/auth/login', { 
        method: 'POST', 
        body: credentials 
    });
}

// Refresh token API
export async function refreshToken(refreshToken) {
    return request('/api/auth/refresh', { 
        method: 'POST', 
        body: { refreshToken } 
    });
}

// Get all users
export async function getAllUsers() {
    return request('/api/users/all', { method: 'GET' });
}

// Change password API
export async function changePassword(passwordData) {
    return request('/api/auth/change-password', { 
        method: 'POST', 
        body: passwordData 
    });
}

// Logout (clear tokens)
export function logout() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_info');
}