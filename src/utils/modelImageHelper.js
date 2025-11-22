/**
 * Helper function để lấy URL hình ảnh từ ImgBB dựa trên tên model
 * 
 * HƯỚNG DẪN: Hình ảnh đang ở Zalo → Cần upload lên ImgBB
 * 
 * BƯỚC 1: Tải hình ảnh từ Zalo về máy
 * 1. Mở Zalo, tìm thư mục hình ảnh (ví dụ: "electra urbanpluse")
 * 2. Click vào từng hình ảnh để xem
 * 3. Click nút "Tải về" hoặc "Download" để tải về máy
 * 4. Lưu vào thư mục dễ tìm (ví dụ: Desktop)
 * 
 * BƯỚC 2: Upload lên ImgBB để lấy direct link
 * 1. Truy cập https://phua.imgbb.com/ (hoặc https://imgbb.com/ nếu chưa có tài khoản)
 * 2. Click nút "Start uploading" hoặc kéo thả hình ảnh vào
 * 3. Chọn hình ảnh đã tải từ Zalo
 * 4. Sau khi upload xong, click vào hình ảnh để xem chi tiết
 * 5. Click nút "Embed codes" hoặc "Get share links"
 * 6. Copy "Direct link" (URL có dạng: https://i.ibb.co/[hash]/[filename].jpg)
 * 
 * BƯỚC 3: Cập nhật vào code
 * - Dán URL vào modelImageMap bên dưới với key là tên model CHÍNH XÁC
 * - Ví dụ: Nếu trong database là "Electra Urbanpluse" thì key phải là 'Electra Urbanpluse'
 * 
 * LƯU Ý:
 * - Nếu có nhiều ảnh cho 1 model (ví dụ: đen, xanh, nâu), chọn 1 ảnh đại diện
 * - Hoặc có thể tạo ảnh tổng hợp (collage) từ nhiều ảnh
 */

// Map tên model với URL hình ảnh trên ImgBB
// ⚠️ QUAN TRỌNG: Tên model phải khớp CHÍNH XÁC với tên trong database
// Format URL từ ImgBB: https://i.ibb.co/[hash]/[filename].jpg
const modelImageMap = {
  // Electra Urbanpluse - có 3 màu: xám, đen, xanh dương
  // Link trang chi tiết:
  // - Màu xám: https://ibb.co/4w9Hy2TZ
  // - Màu đen: https://ibb.co/JRgxwtMq
  // - Màu xanh dương: https://ibb.co/8DsNYygM
  // 
  // Direct links (chọn 1 ảnh đại diện - hiện tại dùng màu xanh dương):
  'Electra Urbanpluse': 'https://i.ibb.co/mCTbNn5J/blue.jpg', // Màu xanh dương
  
  // Các model khác - cập nhật tên và URL tương ứng
  'Electra Acsent': null,
  'Electra Citylink': null,
  'Electra Grandtour': null,
  'Electra Nano': null,
  
  // Thêm các model khác nếu có
  // 'Tên Model Chính Xác': 'https://i.ibb.co/.../filename.jpg',
};

export const getModelImageUrl = (modelName) => {
  if (!modelName) return null;
  
  // Kiểm tra nếu có trong map
  const mappedUrl = modelImageMap[modelName];
  if (mappedUrl) {
    return mappedUrl;
  }
  
  // Nếu không có trong map, trả về null (không hiển thị ảnh)
  return null;
  
  // Hoặc nếu bạn muốn tạo URL động dựa trên tên model:
  // const normalizedName = modelName.toLowerCase().replace(/\s+/g, '-');
  // return `https://phua.imgbb.com/${normalizedName}`;
};

/**
 * Helper để lấy tất cả các model đã có hình ảnh
 */
export const getModelsWithImages = () => {
  return Object.keys(modelImageMap).filter(key => modelImageMap[key] !== null);
};


