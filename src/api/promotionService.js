import { API_URL, buildUrl } from './client';

const getToken = () => sessionStorage.getItem('access_token');

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
        throw new Error(message);
    }
    return data;
}

// Helper function to format date to LocalDateTime format
function formatToLocalDateTime(dateString, isEndDate = false) {
    if (!dateString) return null;
    // If already has time, return as is
    if (dateString.includes('T')) return dateString;
    // Add time: 00:00:00 for start date, 23:59:59 for end date
    return isEndDate 
        ? dateString + 'T23:59:59' 
        : dateString + 'T00:00:00';
}

// Create promotion
export async function createPromotion(promotionData) {
    return request('/api/promotions/create', {
        method: 'POST',
        body: {
            promotionId: promotionData.promotionId || 0,
            promotionName: promotionData.promotionName,
            description: promotionData.description,
            promotionType: promotionData.promotionType, // "PERCENTAGE" | "FIXED_AMOUNT"
            amount: promotionData.amount,
            startDate: formatToLocalDateTime(promotionData.startDate, false),
            endDate: formatToLocalDateTime(promotionData.endDate, true),
            modelId: promotionData.modelId || 0,
            storeId: promotionData.storeId || 0,
            active: promotionData.active !== undefined ? promotionData.active : true
        }
    });
}

// Create promotion for all models
export async function createPromotionForAllModels(promotionData) {
    return request('/api/promotions/create-for-all-models', {
        method: 'POST',
        body: {
            promotionId: promotionData.promotionId || 0,
            promotionName: promotionData.promotionName,
            description: promotionData.description,
            promotionType: promotionData.promotionType, // "PERCENTAGE" | "FIXED_AMOUNT"
            amount: promotionData.amount,
            startDate: formatToLocalDateTime(promotionData.startDate, false),
            endDate: formatToLocalDateTime(promotionData.endDate, true),
            modelId: promotionData.modelId || 0,
            storeId: promotionData.storeId || 0,
            active: promotionData.active !== undefined ? promotionData.active : true
        }
    });
}

// Get all promotions
export async function getAllPromotions() {
    return request('/api/promotions/all', { method: 'GET' });
}

// Update promotion
export async function updatePromotion(promotionId, promotionData) {
    return request(`/api/promotions/${promotionId}`, {
        method: 'PUT',
        body: {
            ...promotionData,
            startDate: formatToLocalDateTime(promotionData.startDate, false),
            endDate: formatToLocalDateTime(promotionData.endDate, true)
        }
    });
}

// Delete promotion
export async function deletePromotion(promotionId) {
    return request(`/api/promotions/${promotionId}`, { method: 'DELETE' });
}

// Get active promotions (helper function - filter client-side)
export async function getActivePromotions() {
    const response = await getAllPromotions();
    const allPromotions = response.data || response;
    const now = new Date();
    
    // Filter promotions that are active and within valid date range
    if (Array.isArray(allPromotions)) {
        return allPromotions.filter(promo => {
            if (!promo.active) return false;
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return now >= startDate && now <= endDate;
        });
    }
    return [];
}

// Calculate discount amount
export function calculateDiscount(price, promotion) {
    if (!promotion || !promotion.active) return 0;
    
    if (promotion.promotionType === 'PERCENTAGE') {
        return (price * promotion.amount) / 100;
    } else if (promotion.promotionType === 'FIXED_AMOUNT') {
        return promotion.amount;
    }
    
    return 0;
}


