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

// Create contract
export async function createContract(contractData) {
    return request('/api/contracts/create', {
        method: 'POST',
        body: {
            contractId: contractData.contractId || 0,
            contractDate: contractData.contractDate || new Date().toISOString().split('T')[0],
            contractFileUrl: contractData.contractFileUrl || '',
            status: contractData.status || 'DRAFT', // DRAFT, PENDING, ACTIVE, COMPLETED, CANCELLED
            depositPrice: contractData.depositPrice || 0,
            totalPayment: contractData.totalPayment,
            remainPrice: contractData.remainPrice || (contractData.totalPayment - (contractData.depositPrice || 0)),
            terms: contractData.terms || '',
            uploadedBy: contractData.uploadedBy || '',
            createdAt: contractData.createdAt || new Date().toISOString(),
            updatedAt: contractData.updatedAt || new Date().toISOString(),
            orderId: contractData.orderId
        }
    });
}

// Get all contracts
export async function getAllContracts() {
    return request('/api/contracts/all', { method: 'GET' });
}

// Get contract by ID
export async function getContractById(contractId) {
    return request(`/api/contracts/${contractId}`, { method: 'GET' });
}

// Get contracts by status
export async function getContractsByStatus(status) {
    return request(`/api/contracts/status/${status}`, { method: 'GET' });
}

// Update contract
export async function updateContract(contractId, contractData) {
    return request(`/api/contracts/update/${contractId}`, {
        method: 'PUT',
        body: contractData
    });
}

// Update contract status
export async function updateContractStatus(contractId, status) {
    return request(`/api/contracts/${contractId}/status`, {
        method: 'PATCH',
        body: { status }
    });
}

// Delete contract
export async function deleteContract(contractId) {
    return request(`/api/contracts/${contractId}`, { method: 'DELETE' });
}

// Get contract file
export async function getContractFile() {
    return request('/api/contracts/file', { method: 'GET' });
}

// Upload contract file
export async function uploadContractFile(contractId, file) {
    const token = getToken();
    const url = `${API_URL}/api/contracts/${contractId}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    
    if (!res.ok) {
        const message = (isJson && data?.message) || res.statusText || 'Upload failed';
        throw new Error(message);
    }
    
    return data;
}

// Upload signed contract file (NEW API)
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
        const message = (isJson && data?.message) || res.statusText || 'Upload failed';
        throw new Error(message);
    }
    
    return data;
}

// Get contract by order ID (helper function)
export async function getContractByOrderId(orderId) {
    const response = await getAllContracts();
    const contracts = response.data || response;
    if (Array.isArray(contracts)) {
        return contracts.find(contract => contract.orderId === orderId);
    }
    return null;
}

// Calculate remaining price
export function calculateRemainPrice(totalPayment, depositPrice) {
    return totalPayment - depositPrice;
}

// Create contract from order (NEW API - simplified)
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

// Get contract HTML with authentication and inline CSS
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

