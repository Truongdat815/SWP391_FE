// Simple API client using Vite env-based base URL
export const API_URL = import.meta?.env?.VITE_API_URL || 'https://tiembanhvuive.io.vn';

// Helper function to build URL without double slashes
export function buildUrl(baseUrl, path) {
    // Remove trailing slash from baseUrl
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
}

// Enhanced request function with token handling
async function request(path, { method = 'GET', body } = {}) {
    const token = sessionStorage.getItem('access_token') || sessionStorage.getItem('accessToken');
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
        let message = res.statusText || 'Request failed';
        
        if (isJson && data) {
            message = data?.message || 
                     data?.error || 
                     data?.errorMessage ||
                     data?.data?.message ||
                     (typeof data === 'string' ? data : message);
        } else if (!isJson && typeof data === 'string') {
            message = data;
        }
        
        const error = new Error(message);
        error.status = res.status;
        error.response = data;
        throw error;
    }
    return data;
}

// Helper functions for backwards compatibility
export async function get(path, options = {}) {
    const skipAuth = options.skipAuth || false;
    
    if (skipAuth) {
        const url = buildUrl(API_URL, path);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        return { data };
    }
    
    const data = await request(path, { method: 'GET', ...options });
    return { data };
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

export { request };


