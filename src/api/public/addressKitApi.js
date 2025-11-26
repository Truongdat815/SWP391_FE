// API service for 34tinhthanh.com
// Documentation: https://34tinhthanh.com
// 2-level address structure: Province -> Ward/Commune

const BASE_URL = 'https://34tinhthanh.com/api';

export const addressKitApi = {
    // Get all provinces
    getAllProvinces: async () => {
        try {
            const response = await fetch(`${BASE_URL}/provinces`);
            if (!response.ok) {
                throw new Error('Failed to fetch provinces');
            }
            const data = await response.json();
            // Map to consistent format { code, name }
            return data.map(p => ({
                code: p.province_code,
                name: p.name
            }));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            return [];
        }
    },

    // Get communes/wards by province code
    getCommunesByProvince: async (provinceCode) => {
        try {
            const response = await fetch(`${BASE_URL}/wards?province_code=${provinceCode}`);
            if (!response.ok) {
                throw new Error('Failed to fetch communes');
            }
            const data = await response.json();
            // Map to consistent format { code, name }
            return data.map(w => ({
                code: w.ward_code,
                name: w.ward_name,
                provinceCode: w.province_code
            }));
        } catch (error) {
            console.error('Error fetching communes:', error);
            return [];
        }
    },

    // Search (optional, if needed later)
    search: async (keyword) => {
        try {
            const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error('Failed to search');
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    }
};
