# 🎨 Auto Color Naming - Tự động đặt tên màu

## ✨ Tính năng mới

Khi bạn chọn màu hoặc nhập mã hex, **tên màu sẽ tự động điền** dựa trên màu gần nhất trong danh sách cơ bản!

## 🎯 Cách hoạt động

### 1. Chọn màu từ Color Picker
```
User click color picker → Chọn màu đỏ
↓
Hex code: #FF0000
↓
Tự động điền tên: "Đỏ"
```

### 2. Nhập mã Hex
```
User gõ: #0000FF
↓
Hệ thống tìm màu gần nhất
↓
Tự động điền tên: "Xanh Dương"
```

### 3. Tùy chỉnh tên sau đó
```
Tên tự động: "Đỏ"
↓
User sửa thành: "Đỏ Ruby Đặc Biệt"
↓
Chọn màu khác → Tên vẫn giữ nguyên (không auto nữa)
```

## 📋 Danh sách màu cơ bản (18 màu)

| Tên | Hex Code | Ví dụ |
|-----|----------|-------|
| Đen | #000000 | ⬛ |
| Trắng | #FFFFFF | ⬜ |
| Đỏ | #FF0000 | 🟥 |
| Xanh Lá | #00FF00 | 🟩 |
| Xanh Dương | #0000FF | 🟦 |
| Vàng | #FFFF00 | 🟨 |
| Cam | #FFA500 | 🟧 |
| Tím | #800080 | 🟪 |
| Hồng | #FFC0CB | 🩷 |
| Nâu | #A52A2A | 🟫 |
| Xám | #808080 | ◼️ |
| Bạc | #C0C0C0 | ⬜ |
| Xám Đậm | #4D4D4D | ⬛ |
| Xanh Navy | #000080 | 🔵 |
| Xanh Lục | #008000 | 🟢 |
| Đỏ Đậm | #8B0000 | 🔴 |
| Xanh Lơ | #00FFFF | 🩵 |
| Đỏ Tươi | #FF6347 | 🔴 |

## 🔬 Thuật toán

Sử dụng **Euclidean Distance** trong không gian RGB:

```javascript
distance = √((R1-R2)² + (G1-G2)² + (B1-B2)²)
```

- Tính khoảng cách giữa màu bạn chọn và tất cả màu cơ bản
- Chọn màu có khoảng cách nhỏ nhất
- Trả về tên màu tương ứng

## 💡 Use Cases

### Case 1: Tạo nhanh màu cơ bản
```
1. Chọn color picker → màu đỏ
2. Tên tự động: "Đỏ"
3. Click "Tạo màu mới" → Xong!
```

### Case 2: Tạo màu custom với gợi ý
```
1. Nhập hex: #5088C9 (xanh dương Tesla)
2. Tên tự động: "Xanh Dương" 
3. Sửa thành: "Xanh Dương Tesla"
4. Click "Tạo màu mới" → Xong!
```

### Case 3: Thay đổi màu mà giữ tên
```
1. Đặt tên: "Màu Đặc Biệt Của Tôi"
2. Chọn màu mới → Tên không đổi (đã custom)
3. Chỉ thay màu, không thay tên
```

## ⚙️ Logic Auto-fill

```javascript
// Tự động điền TÊN khi:
1. Field tên đang TRỐNG
   hoặc
2. Field tên là tên được AUTO-GENERATE trước đó
   (ví dụ: "Đỏ", "Xanh Dương", "Vàng")

// KHÔNG tự động điền khi:
- User đã tự nhập tên custom
  (ví dụ: "Đỏ Ruby Đặc Biệt")
```

## ✅ Benefits

✅ **Nhanh hơn**: Không cần gõ tên màu cơ bản  
✅ **Chính xác**: Tên màu chuẩn theo tiếng Việt  
✅ **Linh hoạt**: Vẫn có thể sửa tên bất cứ lúc nào  
✅ **Thông minh**: Biết khi nào nên auto-fill, khi nào không  

## 🎬 Demo

```
┌──────────────────────────────────┐
│ Tên màu:                         │
│ [Xanh Dương] ← Tự động điền!     │
│                                   │
│ Mã màu:                          │
│ [🎨] [#0000FF]                   │
│                                   │
│ Xem trước:                       │
│ ┌─────┐                          │
│ │█████│ Xanh Dương               │
│ └─────┘ #0000FF                  │
└──────────────────────────────────┘
```

Enjoy the magic! ✨🎨

