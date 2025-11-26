# 🎨 Hướng Dẫn Thêm Logo Electra

## Đã cập nhật
✅ Logo đã được thay thế ở:
- Header trang chủ (HomePage)
- Footer trang chủ
- Header trang chi tiết model (ModelDetailPage)

✅ Giữ lại chữ "Electra" như yêu cầu

## Cách thêm logo

### Bước 1: Chuẩn bị file logo
- File logo nên có định dạng: **PNG** (khuyến nghị) hoặc SVG
- Tên file: `electra-logo.png`
- Kích thước: Khuyến nghị chiều cao khoảng 48-64px (logo sẽ tự động scale)

### Bước 2: Đặt file logo vào thư mục
1. Copy file logo của bạn
2. Đặt vào thư mục: `public/images/electra-logo.png`

Cấu trúc thư mục:
```
public/
└── images/
    └── electra-logo.png  ← Đặt logo ở đây
```

### Bước 3: Kiểm tra
1. Chạy ứng dụng: `npm run dev`
2. Vào trang chủ
3. Logo mới sẽ hiển thị thay thế icon cũ
4. Chữ "Electra" vẫn giữ nguyên

## Fallback
- Nếu logo chưa được đặt vào thư mục, hệ thống sẽ tự động hiển thị icon cũ (chữ "E" trong ô vuông xanh)
- Sau khi đặt logo vào đúng vị trí, logo mới sẽ tự động hiển thị

## Lưu ý
- Logo sẽ tự động điều chỉnh chiều cao là 48px (h-12)
- Chiều rộng sẽ tự động scale theo tỷ lệ
- Logo nên có nền trong suốt (transparent) để hiển thị đẹp trên nền tối
- Format PNG với nền trong suốt là tốt nhất

## Logo hiện tại
Logo mới sẽ hiển thị ở:
- ✅ Header (góc trên bên trái) - cùng với text "Electra"
- ✅ Footer (góc dưới bên trái) - cùng với text "Electra"
- ✅ Trang chi tiết model - Header


