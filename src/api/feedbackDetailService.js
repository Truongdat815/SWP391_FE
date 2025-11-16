import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

// Map frontend category to backend enum
const mapCategoryToBackend = (category) => {
    const normalizedCategory = (category || '').toUpperCase();
    switch (normalizedCategory) {
        case 'SERVICE':
            return 'CUSTOMER_SERVICE';
        case 'PRODUCT':
            return 'PRODUCT_QUALITY';
        case 'COMPLAINT':
            return 'CUSTOMER_SERVICE'; // Map complaint to customer service
        case 'CUSTOMER_SERVICE':
        case 'WEBSITE_EXPERIENCE':
        case 'PRODUCT_QUALITY':
            return normalizedCategory; // Already in backend format
        default:
            return 'CUSTOMER_SERVICE'; // Default fallback
    }
};

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
        const error = new Error(message);
        // Attach response data for better error handling
        error.status = res.status;
        error.data = data;
        error.response = { data };
        console.error(`❌ API Error (Feedback Detail): ${method} ${url}`, { status: res.status, message, data });
        throw error;
    }
    
    return data;
}

// Create feedback detail
export async function createFeedbackDetail(feedbackDetailData) {
    const payload = {
        feedbackId: feedbackDetailData.feedbackId,
        category: mapCategoryToBackend(feedbackDetailData.category), // Map to backend enum: CUSTOMER_SERVICE, PRODUCT_QUALITY, WEBSITE_EXPERIENCE
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

// Get feedback detail by ID
export async function getFeedbackDetailById(feedbackDetailId) {
    return request(`/api/feedback-details/${feedbackDetailId}`, { method: 'GET' });
}

// Get all feedback details by feedbackId
export async function getFeedbackDetailsByFeedbackId(feedbackId) {
    return request(`/api/feedback-details/feedback/${feedbackId}`, { method: 'GET' });
}

// Update feedback detail
export async function updateFeedbackDetail(feedbackDetailId, feedbackDetailData) {
    const payload = { ...feedbackDetailData };
    
    // Map category if provided
    if (payload.category) {
        payload.category = mapCategoryToBackend(payload.category);
    }
    
    return request(`/api/feedback-details/update/${feedbackDetailId}`, {
        method: 'PUT',
        body: payload
    });
}

// Delete feedback detail
export async function deleteFeedbackDetail(feedbackDetailId) {
    return request(`/api/feedback-details/delete/${feedbackDetailId}`, { method: 'DELETE' });
}

