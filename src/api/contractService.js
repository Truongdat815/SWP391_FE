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

// Create contract from order (API: POST /api/contracts/contracts)
export async function createContractFromOrder(orderId) {
    return request('/api/contracts/contracts', {
        method: 'POST',
        body: {
            orderId: orderId
        }
    });
}

// Get contract HTML URL for opening in new tab
export function getContractHtmlUrl(contractId) {
    const baseUrl = API_URL || 'https://tiembanhvuive.io.vn';
    return `${baseUrl}/api/contracts/${contractId}`;
}

// Get contract HTML with authentication and inline CSS (API: GET /api/contracts/{id})
export async function getContractHtml(contractId) {
    const token = getToken();
    const url = `${API_URL}/api/contracts/${contractId}`;
    
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch contract');
    }
    
    let htmlContent = await res.text();
    
    // Fetch CSS from backend and inline it
    try {
        const cssUrl = `${API_URL}/style.css`;
        const cssRes = await fetch(cssUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (cssRes.ok) {
            const cssContent = await cssRes.text();
            console.log('CSS fetched successfully, length:', cssContent.length);
            // Replace external CSS link with inline style
            htmlContent = htmlContent.replace(
                '<link rel="stylesheet" href="/style.css">',
                `<style>${cssContent}</style>`
            );
            console.log('CSS inlined successfully');
        } else {
            console.warn('CSS fetch failed with status:', cssRes.status);
        }
    } catch (cssError) {
        console.error('Could not fetch CSS:', cssError);
        // Continue without CSS if fetch fails
    }
    
    return htmlContent;
}

// Get all contracts (API: GET /api/contracts/all)
export async function getAllContracts() {
    const response = await request('/api/contracts/all', {
        method: 'GET'
    });
    
    // Handle response structure: array or { code, message, data }
    if (Array.isArray(response)) {
        return response;
    }
    if (response?.data) {
        return response.data;
    }
    return response;
}

// Get contract by order ID (check if order has contract)
export async function getContractByOrderId(orderId) {
    try {
        const contracts = await getAllContracts();
        const contractsList = contracts?.data || contracts || [];
        const contract = contractsList.find(c => String(c.orderId) === String(orderId));
        return contract || null;
    } catch (error) {
        console.error('Error checking contract for order:', error);
        return null;
    }
}

// Upload signed contract file (API: POST /api/contracts/{contractId}/upload-signed)
export async function uploadSignedContract(contractId, file) {
    const token = getToken();
    const url = `${API_URL}/api/contracts/${contractId}/upload-signed`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type, let browser set it for multipart/form-data
        },
        body: formData
    });
    
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
        // Try to extract error message from different response formats
        let message = 'Upload failed';
        
        if (isJson) {
            // Check for nested error messages
            message = data?.message || 
                     data?.error || 
                     data?.errorMessage || 
                     (typeof data === 'string' ? data : JSON.stringify(data));
        } else if (typeof data === 'string') {
            message = data;
        }
        
        // If no message found, use status text
        if (!message || message === 'Upload failed') {
            message = res.statusText || 'Upload failed';
        }
        
        // Include full error details for debugging
        const error = new Error(message);
        error.status = res.status;
        error.response = data;
        throw error;
    }
    
    return data;
}
