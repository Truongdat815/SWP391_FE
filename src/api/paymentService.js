import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

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
// Returns VNPay URL if paymentMethod is VNPAY
export async function createPayment(contractId, paymentType, paymentMethod) {
    return request('/api/payment/create', {
        method: 'POST',
        body: {
            contractId: contractId,
            paymentType: paymentType, // "DEPOSIT" or "BALANCE"
            paymentMethod: paymentMethod // "VNPAY" or "CASH"
        }
    });
}

// Get payment history by contract (API: GET /api/payment/contract/{contractId})
// Note: This endpoint may need to be confirmed with backend
export async function getPaymentHistoryByContract(contractId) {
    return request(`/api/payment/contract/${contractId}`, {
        method: 'GET'
    });
}

// Get payment by ID (API: GET /api/payment/{paymentId})
export async function getPaymentById(paymentId) {
    return request(`/api/payment/${paymentId}`, {
        method: 'GET'
    });
}

// Get all payments (API: GET /api/payment/all)
export async function getAllPayments() {
    return request('/api/payment/all', {
        method: 'GET'
    });
}

