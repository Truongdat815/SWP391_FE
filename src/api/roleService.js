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

export async function getAllRoles() {
    try {
        return await request('/api/roles/all', { method: 'GET' });
    } catch (err) {
        if (err.status === 404) {
            console.warn('Roles endpoint not found, returning empty data');
            return { data: [] };
        }
        throw err;
    }
}

export async function getRoleByRoleName(roleName) {
    return request(`/api/roles/${encodeURIComponent(roleName)}`, { method: 'GET' });
}

export async function createRole(role) {
    return request('/api/roles/create', { method: 'POST', body: role });
}

export async function updateRole(roleData) {
    const { roleId, ...role } = roleData;
    return request(`/api/roles/update/${encodeURIComponent(roleId)}`, { method: 'PUT', body: roleData });
}

export async function deleteRole(roleId) {
    return request(`/api/roles/delete/${encodeURIComponent(roleId)}`, { method: 'DELETE' });
}
