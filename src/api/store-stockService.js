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
        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }
    return data;
}

// Get all store stocks
export async function getAllStoreStocks() {
    try {
        return await request('/api/store-stocks/all', { method: 'GET' });
    } catch (err) {
        // Silently handle 404 errors - endpoint may not exist for admin users
        if (err.status === 404) {
            return { data: [] };
        }
        throw err;
    }
}

// Get store stocks by store ID
export async function getStoreStocksByStore(storeId) {
    return request(`/api/store-stocks/by-store/${encodeURIComponent(storeId)}`, { method: 'GET' });
}

// Create new store stock
export async function createStoreStock(storeStock) {
    const response = await request('/api/store-stocks/create', { method: 'POST', body: storeStock });
    // Backend returns { code, message, data: { ... } }
    return response?.data || response;
}

// Update store stock
export async function updateStoreStock({ stockId, ...storeStock }) {
    return request(`/api/store-stocks/update/${encodeURIComponent(stockId)}`, { method: 'PUT', body: storeStock });
}

// Update quantity for specific stock
export async function updateStockQuantity(stockId, quantity) {
    console.log('updateStockQuantity called with:', { stockId, quantity });
    
    // API expects query parameter, not request body
    const url = `/api/store-stocks/${encodeURIComponent(stockId)}/update-quantity?quantity=${encodeURIComponent(quantity)}`;
    console.log('Request URL:', url);
    
    return await request(url, { 
        method: 'PUT'
        // No body needed - quantity is in query parameter
    });
}

// Update price for specific stock
export async function updateStockPrice(stockId, priceOfStore) {
    console.log('updateStockPrice called with:', { stockId, priceOfStore });
    
    // API expects query parameter with field name "price" (not "priceOfStore")
    const url = `/api/store-stocks/${encodeURIComponent(stockId)}/update-price?price=${encodeURIComponent(priceOfStore)}`;
    console.log('Request URL:', url);
    
    return await request(url, { 
        method: 'PUT'
        // No body needed - price is in query parameter
    });
}

// Update price by modelId and colorId (new API)
export async function updatePriceByModelColor(modelId, colorId, price) {
    console.log('updatePriceByModelColor called with:', { modelId, colorId, price });
    
    const response = await request('/api/store-stocks/update-price', {
        method: 'PUT',
        body: {
            modelId: parseInt(modelId),
            colorId: parseInt(colorId),
            price: parseFloat(price)
        }
    });
    
    // Backend returns { code, message, data: { ... } }
    return response?.data || response;
}

// Delete store stock
export async function deleteStoreStock(stockId) {
    return request(`/api/store-stocks/${encodeURIComponent(stockId)}/delete`, { method: 'DELETE' });
}

