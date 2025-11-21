# Hướng Dẫn Lấy Direct Link Từ ImgBB

## ⚠️ Quan Trọng: Link bạn cung cấp là link trang chi tiết, cần lấy direct link

Bạn đã có các link trang chi tiết:
- Màu xám: https://ibb.co/4w9Hy2TZ
- Màu đen: https://ibb.co/JRgxwtMq
- Màu xanh dương: https://ibb.co/8DsNYygM

## Cách Lấy Direct Link:

### Bước 1: Mở link trang chi tiết
Click vào một trong các link trên (ví dụ: https://ibb.co/JRgxwtMq)

### Bước 2: Lấy Direct Link
Có 2 cách:

**Cách 1: Từ phần "Embed codes"**
1. Trên trang chi tiết, tìm phần **"Embed codes"** (thường ở bên phải hoặc dưới hình ảnh)
2. Click vào **"Embed codes"** để mở rộng
3. Tìm phần **"Direct links"** → **"Image link"**
4. Click nút **"copy"** để copy direct link
5. Direct link sẽ có dạng: `https://i.ibb.co/[hash]/[filename].jpg`

**Cách 2: Click chuột phải vào hình ảnh**
1. Click chuột phải vào hình ảnh trên trang chi tiết
2. Chọn **"Copy image address"** hoặc **"Copy image URL"**
3. Đây chính là direct link

### Bước 3: Cập nhật vào code
1. Mở file: `src/utils/modelImageHelper.js`
2. Tìm object `modelImageMap`
3. Dán direct link vào (chọn 1 ảnh đại diện, ví dụ: màu đen)

```javascript
const modelImageMap = {
  'Electra Urbanpluse': 'https://i.ibb.co/.../black.jpg', // Dán direct link vào đây
  // ...
};
```

## Ví Dụ:
Nếu bạn lấy được direct link:
- Màu đen: `https://i.ibb.co/abc123/black.jpg`
- Màu xanh: `https://i.ibb.co/def456/blue.jpg`
- Màu xám: `https://i.ibb.co/ghi789/grey.jpg`

Bạn chọn 1 ảnh đại diện (ví dụ: màu đen) và cập nhật:
```javascript
'Electra Urbanpluse': 'https://i.ibb.co/abc123/black.jpg',
```

## Lưu Ý:
- Direct link phải có thể mở trực tiếp trong trình duyệt (chỉ hiển thị hình ảnh, không có giao diện ImgBB)
- Format thường là: `https://i.ibb.co/...` (không phải `https://ibb.co/...`)

