import { API_URL } from './client';

const getToken = () => sessionStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`🌐 API Request (Feedback Detail): ${method} ${url}`, body ? { body } : '');

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    console.log(`📥 API Response (Feedback Detail): ${method} ${url}`, { status: res.status, data });
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        console.error(`❌ API Error (Feedback Detail): ${method} ${url}`, { status: res.status, message, data });
        throw new Error(message);
    }
    
    return data;
}

// Create feedback detail
export async function createFeedbackDetail(feedbackDetailData) {
    const payload = {
        feedbackId: feedbackDetailData.feedbackId,
        category: feedbackDetailData.category, // "SERVICE", "PRODUCT", "COMPLAINT"
        rating: feedbackDetailData.rating || 0,
        content: feedbackDetailData.content
    };
    
    // feedbackDetailId có thể là 0 hoặc không cần gửi (auto-generated)
    if (feedbackDetailData.feedbackDetailId !== undefined) {
        payload.feedbackDetailId = feedbackDetailData.feedbackDetailId;
    }
    
    console.log('Creating feedback detail:', JSON.stringify(payload, null, 2));
    
    return request('/api/feedback-details/create', {
        method: 'POST',
        body: payload
    });
}

// Get all feedback details by feedbackId
export async function getFeedbackDetailsByFeedbackId(feedbackId) {
    return request(`/api/feedback-details/feedback/${feedbackId}`, { method: 'GET' });
}

// Update feedback detail
export async function updateFeedbackDetail(feedbackDetailId, feedbackDetailData) {
    return request(`/api/feedback-details/update/${feedbackDetailId}`, {
        method: 'PUT',
        body: feedbackDetailData
    });
}


