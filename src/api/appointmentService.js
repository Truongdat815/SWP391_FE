import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token') || localStorage.getItem('accessToken');

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

// Create appointment
export async function createAppointment(appointment) {
    return request('/api/appointments/create', { method: 'POST', body: appointment });
}

// Get all appointments
export async function getAllAppointments() {
    return request('/api/appointments/all', { method: 'GET' });
}

// Get appointment by ID
export async function getAppointmentById(appointmentId) {
    return request(`/api/appointments/${encodeURIComponent(appointmentId)}`, { method: 'GET' });
}

// Update appointment
export async function updateAppointment(appointmentId, appointment) {
    return request(`/api/appointments/${encodeURIComponent(appointmentId)}`, { method: 'PUT', body: appointment });
}

// Delete appointment
export async function deleteAppointment(appointmentId) {
    return request(`/api/appointments/${encodeURIComponent(appointmentId)}`, { method: 'DELETE' });
}


