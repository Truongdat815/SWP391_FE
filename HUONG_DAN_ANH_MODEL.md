# Hướng Dẫn Thêm Hình Ảnh Mẫu Xe (Từ Zalo → ImgBB)

## ⚠️ Lưu Ý: Hình ảnh đang ở Zalo, cần upload lên ImgBB để lấy direct link

## Bước 1: Tải Hình Ảnh Từ Zalo Về Máy

1. Mở Zalo, tìm thư mục hình ảnh (ví dụ: "electra urbanpluse", "store")
2. Click vào từng hình ảnh để xem
3. Click nút **"Tải về"** hoặc **"Download"** để tải về máy
4. Lưu vào thư mục dễ tìm (ví dụ: Desktop hoặc thư mục Downloads)

## Bước 2: Upload Lên ImgBB Để Lấy Direct Link

1. Truy cập https://phua.imgbb.com/ (hoặc https://imgbb.com/ nếu chưa có tài khoản)
2. Click nút **"Start uploading"** hoặc kéo thả hình ảnh vào trang
3. Chọn hình ảnh đã tải từ Zalo
4. Sau khi upload xong, click vào hình ảnh để xem chi tiết
5. Click nút **"Embed codes"** hoặc **"Get share links"**
6. Copy **"Direct link"** (URL có dạng: `https://i.ibb.co/[hash]/[filename].jpg`)

**Lưu ý:** 
- Nếu có nhiều ảnh cho 1 model (ví dụ: đen, xanh, nâu), bạn có thể:
  - Chọn 1 ảnh đại diện (thường là ảnh đầu tiên hoặc ảnh đẹp nhất)
  - Hoặc tạo ảnh tổng hợp (collage) từ nhiều ảnh rồi upload

## Bước 3: Cập Nhật Vào File Helper

1. Mở file: `src/utils/modelImageHelper.js`
2. Tìm object `modelImageMap`
3. Thêm hoặc cập nhật URL với key là **tên model CHÍNH XÁC** (phải khớp với tên trong database)

### Ví dụ:
```javascript
const modelImageMap = {
  'Electra Urbanpluse': 'https://i.ibb.co/abc123/electra-urbanpluse.jpg',
  'Electra Acsent': 'https://i.ibb.co/def456/electra-acsent.jpg',
  // ... các model khác
};
```

## ⚠️ Lưu Ý Quan Trọng:

1. **Tên model phải khớp CHÍNH XÁC** với tên trong database
   - Ví dụ: Nếu database có "Electra Urbanpluse" thì key phải là `'Electra Urbanpluse'`
   - Không phân biệt hoa thường, nhưng phải khớp khoảng trắng và ký tự đặc biệt

2. **Nếu có nhiều ảnh cho 1 model** (ví dụ: đen, xanh, nâu):
   - Chọn 1 ảnh đại diện (thường là ảnh đầu tiên hoặc ảnh đẹp nhất)
   - Hoặc có thể tạo ảnh tổng hợp (collage)

3. **Kiểm tra URL**:
   - URL phải là direct link (có thể mở trực tiếp trong trình duyệt)
   - Format thường là: `https://i.ibb.co/...` hoặc `https://ibb.co/...`

## Bước 3: Kiểm Tra

1. Refresh trang (F5)
2. Kiểm tra dashboard xem hình ảnh đã hiển thị chưa
3. Nếu không hiển thị, kiểm tra:
   - Tên model có khớp không?
   - URL có đúng không? (thử mở URL trực tiếp trong trình duyệt)
   - Console có lỗi không?

## Ví Dụ Cụ Thể:

Nếu bạn có thư mục "electra urbanpluse" với 3 ảnh:
- Ảnh 1: Đen (https://i.ibb.co/abc123/black.jpg)
- Ảnh 2: Xanh (https://i.ibb.co/def456/blue.jpg)  
- Ảnh 3: Nâu (https://i.ibb.co/ghi789/brown.jpg)

Bạn chọn ảnh đại diện (ví dụ: ảnh đen) và cập nhật:
```javascript
'Electra Urbanpluse': 'https://i.ibb.co/abc123/black.jpg',
```

