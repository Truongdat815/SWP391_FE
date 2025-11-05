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
    
    // Handle wrapper format {code, message, data}
    return data?.data !== undefined ? data.data : data;
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
    return request(`/api/appointments/update/${encodeURIComponent(appointmentId)}`, { method: 'PUT', body: appointment });
}

// Delete appointment
export async function deleteAppointment(appointmentId) {
    return request(`/api/appointments/${encodeURIComponent(appointmentId)}`, { method: 'DELETE' });
}

// Get appointments by store
export async function getAppointmentsByStore(storeId) {
    return request(`/api/appointments/store/${encodeURIComponent(storeId)}`, { method: 'GET' });
}

// Get appointments by status
export async function getAppointmentsByStatus(status) {
    return request(`/api/appointments/status/${encodeURIComponent(status)}`, { method: 'GET' });
}

// Get appointments by staff
export async function getAppointmentsByStaff(staffId) {
    return request(`/api/appointments/staff/${encodeURIComponent(staffId)}`, { method: 'GET' });
}

// Get appointments by model
export async function getAppointmentsByModel(modelId) {
    return request(`/api/appointments/model/${encodeURIComponent(modelId)}`, { method: 'GET' });
}

// Get appointments by customer
export async function getAppointmentsByCustomer(customerId) {
    return request(`/api/appointments/customer/${encodeURIComponent(customerId)}`, { method: 'GET' });
}

// Update appointment status
export async function updateAppointmentStatus(appointmentId, status) {
    return request(`/api/appointments/${encodeURIComponent(appointmentId)}/status`, { method: 'PATCH', body: { status } });
}


