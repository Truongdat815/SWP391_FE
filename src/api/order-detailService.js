import { API_URL } from './client';

const getToken = () => localStorage.getItem('access_token');

async function request(path, { method = 'GET', body } = {}) {
    const token = getToken();
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`🌐 API Request (Order Details): ${method} ${url}`, body ? { body } : '');
    console.log(`[API ${method}] ${url}`, body ? { body } : '');

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    console.log(`📥 API Response (Order Details): ${method} ${url}`, { status: res.status, data });
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Request failed';
        console.error(`❌ API Error (Order Details): ${method} ${url}`, { status: res.status, message, data });
        
        // Don't log 404 as error for order details (it's expected for new orders)
        if (res.status === 404 && path.includes('/order-details/order/')) {
            console.log(`[API 404] ${url} - Order has no details yet (this is normal)`);
        } else {
            console.error(`[API ERROR ${res.status}] ${url}`, {
                status: res.status,
                statusText: res.statusText,
                response: data,
                sentData: body
            });
        }
        
        throw new Error(message);
    }
    
    console.log(`[API SUCCESS] ${url}`, data);
    return data;
}

// Create order detail - Match Swagger API schema
// Expected body: { orderId: number, orderDetails: [{ modelId, colorId, quantity, promotionId }] }
// Create order detail - sends single item in array format
export async function createOrderDetail(orderDetailData) {
    // Build single order detail item
    const orderDetailItem = {
        storeStockId: orderDetailData.storeStockId,
        unitPrice: orderDetailData.unitPrice,
        quantity: orderDetailData.quantity,
        vatAmount: orderDetailData.vatAmount,
        licensePlateFee: orderDetailData.licensePlateFee,
        registrationFee: orderDetailData.registrationFee,
        discountAmount: orderDetailData.discountAmount,
        totalPrice: orderDetailData.totalPrice,
        promotionId: orderDetailData.promotionId || 0
    };
    
    // Add optional IDs only if they have values
    if (orderDetailData.modelId) orderDetailItem.modelId = orderDetailData.modelId;
    if (orderDetailData.modelColorId) orderDetailItem.modelColorId = orderDetailData.modelColorId;
    if (orderDetailData.colorId) orderDetailItem.colorId = orderDetailData.colorId;
    
    // Backend expects orderDetails array with orderId at top level
    const payload = {
        orderId: orderDetailData.orderId,
        orderDetails: [orderDetailItem]
    };
    
    console.log('Creating order detail:', JSON.stringify(payload, null, 2));
    
    return request('/api/order-details/create', {
        method: 'POST',
        body: payload
    });
}

// Create multiple order details in one request
// New simplified API: backend calculates all prices
export async function createOrderDetailsInBatch(orderId, orderDetailsArray) {
    // Build order details array for backend - only send required fields
    const orderDetailsItems = orderDetailsArray.map(detail => ({
        modelId: detail.modelId,
        colorId: detail.colorId,
        quantity: detail.quantity,
        promotionId: detail.promotionId || 0
    }));
    
    // Backend expects orderDetails array with orderId at top level
    const payload = {
        orderId: orderId,
        orderDetails: orderDetailsItems
    };
    
    console.log(`Creating ${orderDetailsItems.length} order details in batch:`, JSON.stringify(payload, null, 2));
    
    return request('/api/order-details/create', {
        method: 'POST',
        body: payload
    });
}

// Validate order detail before creating
// Expected body: { modelId, colorId, quantity, promotionId }
export async function validateOrderDetail(orderDetailData) {
    const payload = {
        modelId: orderDetailData.modelId,
        colorId: orderDetailData.colorId,
        quantity: orderDetailData.quantity,
        promotionId: orderDetailData.promotionId || 0
    };
    
    console.log('Validating order detail:', JSON.stringify(payload, null, 2));
    
    return request('/api/order-details/validate', {
        method: 'POST',
        body: payload
    });
}

// Get all order details
export async function getAllOrderDetails() {
    return request('/api/order-details/all', { method: 'GET' });
}

// Get order details by order ID
export async function getOrderDetailsByOrderId(orderId) {
    return request(`/api/order-details/order/${orderId}`, { method: 'GET' });
}

// Get order detail by ID
export async function getOrderDetailById(orderDetailId) {
    return request(`/api/order-details/${orderDetailId}`, { method: 'GET' });
}

// Update order detail
export async function updateOrderDetail(orderDetailId, orderDetailData) {
    return request(`/api/order-details/${orderDetailId}`, {
        method: 'PUT',
        body: orderDetailData
    });
}

// Delete order detail
export async function deleteOrderDetail(orderDetailId) {
    return request(`/api/order-details/${orderDetailId}`, { method: 'DELETE' });
}