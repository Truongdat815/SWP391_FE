import { API_URL, buildUrl } from './client';

const getToken = () => sessionStorage.getItem('access_token') || sessionStorage.getItem('accessToken');

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
        const error = new Error(message);
        // Giữ lại response data để có thể log chi tiết
        error.response = {
            status: res.status,
            statusText: res.statusText,
            data: data
        };
        throw error;
    }
    
    // Handle wrapper format {code, message, data}
    return data?.data !== undefined ? data.data : data;
}

// Create test drive config
export async function createTestDriveConfig(config) {
    return request('/api/test-drive-configs/create', { method: 'POST', body: config });
}

// Get current test drive config (config của store tương ứng với user đang đăng nhập)
// API này trả về config của store tương ứng với user hiện tại, không cần gửi storeId
export async function getCurrentTestDriveConfig() {
    return request('/api/test-drive-configs/current', { method: 'GET' });
}

// Get test drive config by ID
export async function getTestDriveConfigById(configId) {
    return request(`/api/test-drive-configs/${encodeURIComponent(configId)}`, { method: 'GET' });
}

// Update test drive config
export async function updateTestDriveConfig(configId, config) {
    return request(`/api/test-drive-configs/update/${encodeURIComponent(configId)}`, { method: 'PUT', body: config });
}

// Delete test drive config
export async function deleteTestDriveConfig(configId) {
    return request(`/api/test-drive-configs/${encodeURIComponent(configId)}`, { method: 'DELETE' });
}

