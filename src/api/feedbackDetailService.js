import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

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

// Map frontend category to backend enum
// Frontend: 'service', 'product', 'complaint'
// Backend: 'CUSTOMER_SERVICE', 'PRODUCT_QUALITY', 'OTHERS', 'DELIVERY_SERVICE', 'WEBSITE_EXPERIENCE'
export const mapCategoryToBackend = (frontendCategory) => {
    const normalized = frontendCategory?.toLowerCase();
    switch (normalized) {
        case 'service':
            return 'CUSTOMER_SERVICE';
        case 'product':
            return 'PRODUCT_QUALITY';
        case 'complaint':
            return 'OTHERS';
        default:
            return 'OTHERS';
    }
};

// Map backend enum to frontend category
export const mapCategoryFromBackend = (backendCategory) => {
    if (!backendCategory) return 'service';
    
    const normalized = backendCategory?.toLowerCase();
    switch (normalized) {
        case 'customer_service':
        case 'delivery_service':
            return 'service';
        case 'product_quality':
            return 'product';
        case 'website_experience':
        case 'others':
            return 'complaint';
        default:
            return 'service';
    }
};

// Create feedback detail
export async function createFeedbackDetail(feedbackDetailData) {
    const payload = {
        feedbackId: feedbackDetailData.feedbackId,
        category: mapCategoryToBackend(feedbackDetailData.category), // Map to backend enum
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
    const payload = {
        ...feedbackDetailData,
        category: mapCategoryToBackend(feedbackDetailData.category) // Map to backend enum
    };
    
    return request(`/api/feedback-details/update/${feedbackDetailId}`, {
        method: 'PUT',
        body: payload
    });
}

// Delete feedback detail
export async function deleteFeedbackDetail(feedbackDetailId) {
    return request(`/api/feedback-details/delete/${feedbackDetailId}`, { method: 'DELETE' });
}

