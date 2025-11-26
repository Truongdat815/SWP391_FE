# Hướng Dẫn Chỉnh Sửa Code - SWP391 Frontend

## 📁 Cấu Trúc Dự Án

Dự án này được tổ chức theo kiến trúc **Feature-based** với React + Redux Toolkit Query.

```
src/
├── api/              # API calls (gọi backend)
├── components/       # Components dùng chung
├── features/         # Các trang/feature theo role
├── router/          # Định tuyến (routing)
├── store/           # Redux store (quản lý state)
└── utils/           # Các hàm tiện ích
```

---

## 🎯 Các Loại Chỉnh Sửa Thường Gặp

### 1. **Chỉnh Sửa Giao Diện (UI) của một Trang**

**Ví dụ:** "Thầy muốn thay đổi màu nút trong trang Promotion"

**File cần sửa:**
- `src/features/dealerManager/promotion/PromotionPage.jsx` (file bạn đang mở)

**Cách làm:**
1. Mở file `.jsx` của trang đó
2. Tìm phần JSX (return statement) 
3. Sửa các class CSS (dùng Tailwind CSS)
4. Lưu file → Tự động reload

**Ví dụ cụ thể:**
```jsx
// Trước
<Button className="bg-blue-500">Tạo mới</Button>

// Sau
<Button className="bg-green-500">Tạo mới</Button>
```

---

### 2. **Thêm/Sửa Chức Năng (Logic)**

**Ví dụ:** "Thêm validation cho form tạo promotion"

**File cần sửa:**
- File trang đó (ví dụ: `PromotionPage.jsx`)
- Có thể cần sửa API file nếu cần thay đổi cách gọi backend

**Cách làm:**
1. Tìm hàm xử lý (handleSubmit, handleCreate, etc.)
2. Thêm logic validation
3. Test lại

**Ví dụ:**
```jsx
const handleCreate = async () => {
  // Thêm validation
  if (!formData.promotionName) {
    alert('Vui lòng nhập tên promotion');
    return;
  }
  
  // Logic cũ...
};
```

---

### 3. **Thay Đổi API Call (Gọi Backend)**

**Ví dụ:** "Thay đổi endpoint lấy danh sách promotion"

**File cần sửa:**
- `src/api/dealerManager/promotionApi.js` (file API tương ứng)

**Cách làm:**
1. Mở file API trong thư mục `api/`
2. Tìm endpoint cần sửa
3. Sửa URL hoặc parameters
4. Nếu thay đổi response format, cần sửa cả file component dùng nó

**Ví dụ:**
```javascript
// Trong promotionApi.js
export const promotionApi = createApi({
  endpoints: (builder) => ({
    getAllPromotions: builder.query({
      query: () => '/api/promotions', // Sửa URL ở đây
    }),
  }),
});
```

---

### 4. **Thêm Component Mới**

**Ví dụ:** "Tạo component hiển thị thông báo mới"

**File cần tạo:**
- Nếu dùng chung: `src/components/shared/NewNotification.jsx`
- Nếu chỉ dùng trong 1 feature: `src/features/.../NewNotification.jsx`

**Cách làm:**
1. Tạo file `.jsx` mới
2. Viết component
3. Import và dùng ở nơi cần

---

### 5. **Thay Đổi Routing (Đường Dẫn)**

**Ví dụ:** "Thêm route mới cho trang quản lý khách hàng"

**File cần sửa:**
- `src/router/AppRouter.jsx`

**Cách làm:**
1. Mở `AppRouter.jsx`
2. Thêm route mới vào mảng routes
3. Đảm bảo đã tạo component tương ứng

---

### 6. **Sửa Layout (Header, Sidebar)**

**Ví dụ:** "Thêm menu mới vào sidebar"

**File cần sửa:**
- `src/components/layout/Sidebar.jsx` (cho sidebar)
- `src/components/layout/Header.jsx` (cho header)
- Hoặc layout cụ thể: `DealerManagerLayout.jsx`, `AdminLayout.jsx`, etc.

---

### 7. **Thay Đổi Authentication/Authorization**

**Ví dụ:** "Thay đổi cách check quyền truy cập"

**File cần sửa:**
- `src/router/ProtectedRoute.jsx` hoặc `RoleRoute.jsx`
- `src/store/slices/authSlice.js` (nếu sửa state auth)
- `src/api/auth/authApi.js` (nếu sửa API login)

---

## 🔍 Cách Tìm File Cần Sửa

### **Theo Role/Chức Năng:**

| Thầy yêu cầu | File cần sửa |
|-------------|--------------|
| "Sửa trang quản lý promotion" | `src/features/dealerManager/promotion/PromotionPage.jsx` |
| "Sửa trang đơn hàng của dealer staff" | `src/features/dealerStaff/orders/OrderManagementPage.jsx` |
| "Sửa dashboard admin" | `src/features/admin/dashboard/AdminDashboard.jsx` |
| "Sửa trang login" | `src/features/public/login/LoginPage.jsx` |
| "Sửa API lấy danh sách model" | `src/api/admin/modelApi.js` |
| "Sửa component Button" | `src/components/ui/Button.jsx` |
| "Sửa sidebar" | `src/components/layout/Sidebar.jsx` |

### **Theo Tên Feature:**

- **Admin features:** `src/features/admin/...`
- **Dealer Manager:** `src/features/dealerManager/...`
- **Dealer Staff:** `src/features/dealerStaff/...`
- **EVM Staff:** `src/features/evmStaff/...`
- **Public (không cần login):** `src/features/public/...`

---

## 🛠️ Quy Trình Chỉnh Sửa

### **Bước 1: Xác định file cần sửa**
- Đọc yêu cầu của thầy
- Tìm file tương ứng trong cấu trúc dự án

### **Bước 2: Đọc và hiểu code hiện tại**
- Đọc file đó
- Hiểu logic đang có
- Xác định chỗ cần sửa

### **Bước 3: Thực hiện chỉnh sửa**
- Sửa code
- Kiểm tra syntax

### **Bước 4: Test**
- Chạy `npm run dev` để xem kết quả
- Kiểm tra console có lỗi không
- Test chức năng

### **Bước 5: Commit (nếu cần)**
```bash
git add .
git commit -m "Mô tả thay đổi"
```

---

## 📝 Ví Dụ Cụ Thể

### **Ví dụ 1: "Thay đổi màu nút 'Tạo mới' thành màu xanh"**

1. **File:** `src/features/dealerManager/promotion/PromotionPage.jsx`
2. **Tìm:** Dòng có text "Tạo mới" hoặc button có `Plus` icon
3. **Sửa:** Đổi className từ `bg-blue-500` → `bg-green-500`
4. **Lưu và test**

### **Ví dụ 2: "Thêm validation: không cho tạo promotion nếu thiếu tên"**

1. **File:** `src/features/dealerManager/promotion/PromotionPage.jsx`
2. **Tìm:** Hàm `handleCreate` hoặc `handleSubmit`
3. **Sửa:** Thêm check `if (!formData.promotionName) { alert(...); return; }`
4. **Lưu và test**

### **Ví dụ 3: "Thay đổi API endpoint lấy promotion"**

1. **File:** `src/api/dealerManager/promotionApi.js`
2. **Tìm:** Endpoint `getAllPromotions`
3. **Sửa:** URL trong `query: () => '/api/promotions'`
4. **Lưu và test**

### **Ví dụ 4: "Thêm cột mới vào bảng promotion"**

1. **File:** `src/features/dealerManager/promotion/PromotionPage.jsx`
2. **Tìm:** Phần định nghĩa columns của Table
3. **Sửa:** Thêm object mới vào mảng columns
4. **Lưu và test**

---

## ⚠️ Lưu Ý Quan Trọng

1. **Luôn backup trước khi sửa lớn** (hoặc commit thường xuyên)
2. **Kiểm tra console** để phát hiện lỗi
3. **Nếu sửa API**, có thể cần sửa cả component dùng nó
4. **Nếu sửa component dùng chung**, tất cả nơi dùng nó sẽ bị ảnh hưởng
5. **Dùng `npm run dev`** để xem thay đổi real-time

---

## 🚀 Chạy Dự Án

```bash
# Cài đặt dependencies (lần đầu)
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

---

## 📚 Tài Liệu Tham Khảo

- **React:** https://react.dev
- **Redux Toolkit Query:** https://redux-toolkit.js.org/rtk-query/overview
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Router:** https://reactrouter.com

---

## ❓ Câu Hỏi Thường Gặp

**Q: Làm sao biết file nào cần sửa?**
A: Dựa vào yêu cầu của thầy:
- Nếu nói về "trang X" → tìm trong `features/`
- Nếu nói về "API" → tìm trong `api/`
- Nếu nói về "component" → tìm trong `components/`

**Q: Sửa xong không thấy thay đổi?**
A: 
- Refresh browser (Ctrl+F5)
- Kiểm tra console có lỗi không
- Đảm bảo đã lưu file
- Kiểm tra đúng file đang chạy

**Q: Làm sao tìm một function cụ thể?**
A: Dùng Ctrl+F trong VS Code để search trong file, hoặc search toàn bộ project

---

**Chúc bạn code vui vẻ! 🎉**

