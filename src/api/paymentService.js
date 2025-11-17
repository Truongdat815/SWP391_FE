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

// Create payment (API: POST /api/payment/create)
// Returns { paymentId, paymentUrl } if paymentMethod is VNPAY
export async function createPayment(contractId, paymentType, paymentMethod) {
    const response = await request('/api/payment/create', {
        method: 'POST',
        body: {
            contractId: contractId,
            paymentType: paymentType, // "DEPOSIT" or "BALANCE"
            paymentMethod: paymentMethod // "VNPAY" or "CASH"
        }
    });
    
    // Handle response structure: { code, message, data } or direct response
    if (response?.data) {
        return response.data;
    }
    return response;
}

// Get payment history by contract - filter from all payments
// This is a helper function that filters payments by contractId
export function filterPaymentsByContract(payments, contractId, contractCode = null) {
    if (!Array.isArray(payments)) {
        return [];
    }
    
    return payments.filter(payment => {
        // Match by contractId
        if (payment.contractId && String(payment.contractId) === String(contractId)) {
            return true;
        }
        // Match by contractCode if provided
        if (contractCode && payment.contractCode && payment.contractCode === contractCode) {
            return true;
        }
        return false;
    });
}

// Get payment by ID (API: GET /api/payment/{paymentId})
export async function getPaymentById(paymentId) {
    const response = await request(`/api/payment/${paymentId}`, {
        method: 'GET'
    });
    
    // Handle response structure: { code, message, data }
    if (response?.data) {
        return { data: response.data };
    }
    return { data: response };
}

// Get all payments (API: GET /api/payment/all)
export async function getAllPayments() {
    const response = await request('/api/payment/all', {
        method: 'GET'
    });
    
    // Handle response structure: { code, message, data } or array
    if (Array.isArray(response)) {
        return response;
    }
    if (response?.data) {
        return response.data;
    }
    return response;
}

