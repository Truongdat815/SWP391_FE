import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`🌐 API Request (Feedback): ${method} ${url}`, body ? { body } : '');

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    console.log(`📥 API Response (Feedback): ${method} ${url}`, { status: res.status, data });
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        console.error(`❌ API Error (Feedback): ${method} ${url}`, { status: res.status, message, data });
        throw new Error(message);
    }
    
    return data;
}

// Create feedback (draft)
export async function createFeedback(feedbackData) {
    const payload = {
        orderId: feedbackData.orderId,
        customerName: feedbackData.customerName,
        status: feedbackData.status || 'DRAFT'
    };
    
    console.log('Creating feedback:', JSON.stringify(payload, null, 2));
    
    return request('/api/feedbacks/create', {
        method: 'POST',
        body: payload
    });
}

// Get feedback by ID
export async function getFeedbackById(feedbackId) {
    return request(`/api/feedbacks/${feedbackId}`, { method: 'GET' });
}

// Get all feedbacks
export async function getAllFeedbacks() {
    return request('/api/feedbacks/all', { method: 'GET' });
}

// Get feedbacks by status
export async function getFeedbacksByStatus(status) {
    return request(`/api/feedbacks/status/${status}`, { method: 'GET' });
}

// Update feedback status
export async function updateFeedbackStatus(feedbackId, status) {
    return request(`/api/feedbacks/update/${feedbackId}`, {
        method: 'PUT',
        body: { status }
    });
}

// Update feedback (full update)
export async function updateFeedback(feedbackId, feedbackData) {
    return request(`/api/feedbacks/update/${feedbackId}`, {
        method: 'PUT',
        body: feedbackData
    });
}

// Delete feedback
export async function deleteFeedback(feedbackId) {
    return request(`/api/feedbacks/delete/${feedbackId}`, { method: 'DELETE' });
}

