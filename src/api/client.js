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

// Helper để fetch external API không cần auth và không trigger preflight
export async function fetchExternalApi(url, options = {}) {
  // Không thêm Content-Type cho GET requests để tránh preflight
  const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    ...options,
    // Chỉ set headers nếu có custom headers được cung cấp
    headers: options.headers || {}
  };
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}

// Helper functions to replace axiosClient usage
export async function get(path, options = {}) {
    // Check if we should skip token (for public endpoints)
    const skipAuth = options.skipAuth || false;
    
    if (skipAuth) {
        // Public API call without token
        const data = await getJson(path, options);
        return { data };
    }
    
    // Use request() function which handles token automatically
    const data = await request(path, { method: 'GET', ...options });
    return { data }; // Mimic axios response structure
}

export async function post(path, body, options = {}) {
    const data = await request(path, { method: 'POST', body, ...options });
    return { data }; // Mimic axios response structure
}

export async function put(path, body, options = {}) {
    const data = await request(path, { method: 'PUT', body, ...options });
    return { data }; // Mimic axios response structure
}

export async function del(path, options = {}) {
    const data = await request(path, { method: 'DELETE', ...options });
    return { data }; // Mimic axios response structure
}

// Enhanced request function with token handling
async function request(path, { method = 'GET', body } = {}) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
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


