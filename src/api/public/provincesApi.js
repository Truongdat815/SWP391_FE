// API service for Vietnam Provinces API
// Documentation: https://provinces.open-api.vn/

const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api/v1';

export const provincesApi = {
  // Lấy danh sách tất cả tỉnh/thành phố
  getAllProvinces: async () => {
    const response = await fetch(`${PROVINCES_API_BASE}/?depth=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    return response.json();
  },

  // Lấy chi tiết tỉnh/thành phố kèm quận/huyện
  getProvinceWithDistricts: async (provinceCode) => {
    const response = await fetch(`${PROVINCES_API_BASE}/p/${provinceCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch province details');
    }
    return response.json();
  },

  // Lấy chi tiết quận/huyện kèm phường/xã
  getDistrictWithWards: async (districtCode) => {
    const response = await fetch(`${PROVINCES_API_BASE}/d/${districtCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch district details');
    }
    return response.json();
  },
};

