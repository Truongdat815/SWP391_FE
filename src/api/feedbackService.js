import { API_URL } from './client';

const getToken = () => sessionStorage.getItem('access_token');

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
        const error = new Error(message);
        // Attach response data for better error handling
        error.status = res.status;
        error.data = data;
        error.response = { data };
        console.error(`❌ API Error (Feedback): ${method} ${url}`, { status: res.status, message, data });
        throw error;
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
    
    // Include optional fields if provided (for APIs that accept them in the main request)
    if (feedbackData.category !== undefined) {
        payload.category = mapCategoryToBackend(feedbackData.category);
    }
    if (feedbackData.rating !== undefined) {
        payload.rating = feedbackData.rating;
    }
    if (feedbackData.content !== undefined && feedbackData.content !== null) {
        payload.content = feedbackData.content;
    }
    
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

// Update feedback status
export async function updateFeedbackStatus(feedbackId, status) {
    return request(`/api/feedbacks/update/${feedbackId}`, {
        method: 'PUT',
        body: { status }
    });
}

// Update feedback (full update)
export async function updateFeedback(feedbackId, feedbackData) {
    const payload = { ...feedbackData };
    
    // Map category if provided
    if (payload.category) {
        payload.category = mapCategoryToBackend(payload.category);
    }
    
    return request(`/api/feedbacks/update/${feedbackId}`, {
        method: 'PUT',
        body: payload
    });
}

// Delete feedback
export async function deleteFeedback(feedbackId) {
    return request(`/api/feedbacks/${feedbackId}`, {
        method: 'DELETE'
    });
}

