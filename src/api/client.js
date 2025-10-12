// Simple API client using Vite env-based base URL
// For development with Vite proxy, leave empty to use relative paths
export const API_URL = (import.meta?.env?.VITE_API_URL || '').replace(/\/+$/, '');

export async function apiFetch(path, options = {}) {
    const isAbsolute = /^https?:\/\//i.test(path);
    const url = isAbsolute ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

    const defaultHeaders = { 'Content-Type': 'application/json' };
    const headers = { ...defaultHeaders, ...(options.headers || {}) };

    const response = await fetch(url, { ...options, headers });
    return response;
}

export async function getJson(path, options = {}) {
    const res = await apiFetch(path, { method: 'GET', ...options });
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
}


