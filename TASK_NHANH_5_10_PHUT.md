# 🚀 Các Task Nhanh 5-10 Phút Thầy Thường Yêu Cầu

## ⚡ Task Siêu Nhanh (2-3 phút)

### 1. **Thay Đổi Màu Sắc**
**Ví dụ:** "Đổi màu nút từ xanh sang đỏ"
- **File:** File trang đó (ví dụ: `PromotionPage.jsx`)
- **Tìm:** `className="bg-blue-600"` hoặc `variant="primary"`
- **Sửa:** 
  ```jsx
  // Trước
  <Button variant="primary">Tạo mới</Button>
  // Hoặc
  <Button className="bg-blue-600">Tạo mới</Button>
  
  // Sau
  <Button variant="danger">Tạo mới</Button>
  // Hoặc
  <Button className="bg-red-600">Tạo mới</Button>
  ```

### 2. **Thay Đổi Text/Label**
**Ví dụ:** "Đổi 'Tạo mới' thành 'Thêm mới'"
- **File:** File trang đó
- **Tìm:** Text cần đổi (Ctrl+F)
- **Sửa:** Thay text trực tiếp
  ```jsx
  // Trước
  <Button>Tạo mới</Button>
  
  // Sau
  <Button>Thêm mới</Button>
  ```

### 3. **Thay Đổi Placeholder**
**Ví dụ:** "Đổi placeholder của ô tìm kiếm"
- **File:** File trang đó
- **Tìm:** `<Input placeholder="..."/>`
- **Sửa:**
  ```jsx
  // Trước
  <Input placeholder="Tìm kiếm..." />
  
  // Sau
  <Input placeholder="Nhập từ khóa..." />
  ```

### 4. **Thay Đổi Kích Thước Nút/Text**
**Ví dụ:** "Làm nút to hơn"
- **File:** File trang đó
- **Tìm:** Button component
- **Sửa:**
  ```jsx
  // Trước
  <Button size="md">Tạo mới</Button>
  
  // Sau
  <Button size="lg">Tạo mới</Button>
  // Hoặc
  <Button className="text-lg px-6 py-3">Tạo mới</Button>
  ```

### 5. **Thay Đổi Badge Màu**
**Ví dụ:** "Đổi badge 'Đang hoạt động' sang màu xanh"
- **File:** File trang đó
- **Tìm:** `<Badge variant="...">`
- **Sửa:**
  ```jsx
  // Trước
  <Badge variant="default">Đang hoạt động</Badge>
  
  // Sau
  <Badge variant="success">Đang hoạt động</Badge>
  ```

---

## 🔧 Task Nhanh (5-7 phút)

### 6. **Thêm Validation Đơn Giản**
**Ví dụ:** "Không cho submit nếu thiếu tên"
- **File:** File trang đó
- **Tìm:** Hàm `handleCreate` hoặc `handleSubmit`
- **Sửa:** Thêm check ở đầu hàm
  ```jsx
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Thêm validation
    if (!formData.promotionName || formData.promotionName.trim() === '') {
      alert('Vui lòng nhập tên');
      return;
    }
    
    // Code cũ...
  };
  ```

### 7. **Thay Đổi Số Items Per Page**
**Ví dụ:** "Hiển thị 20 items thay vì 10"
- **File:** File trang đó
- **Tìm:** `const [itemsPerPage] = useState(10);`
- **Sửa:**
  ```jsx
  // Trước
  const [itemsPerPage] = useState(10);
  
  // Sau
  const [itemsPerPage] = useState(20);
  ```

### 8. **Thêm/Xóa Một Field Trong Form**
**Ví dụ:** "Thêm field 'Ghi chú' vào form"
- **File:** File trang đó
- **Tìm:** Phần form (modal create/edit)
- **Sửa:**
  ```jsx
  // 1. Thêm vào formData state
  const [formData, setFormData] = useState({
    // ... các field cũ
    note: '', // Thêm field mới
  });
  
  // 2. Thêm vào JSX form
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Ghi chú
    </label>
    <Input
      value={formData.note}
      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
      placeholder="Nhập ghi chú..."
    />
  </div>
  ```

### 9. **Thay Đổi Icon**
**Ví dụ:** "Đổi icon 'Xóa' từ Trash2 sang X"
- **File:** File trang đó
- **Tìm:** Import và sử dụng icon
- **Sửa:**
  ```jsx
  // Trước
  import { Trash2 } from 'lucide-react';
  <Trash2 />
  
  // Sau
  import { X } from 'lucide-react';
  <X />
  ```

### 10. **Thay Đổi Message/Alert**
**Ví dụ:** "Đổi message lỗi thành tiếng Anh"
- **File:** File trang đó
- **Tìm:** `setErrorModal` hoặc `alert(...)`
- **Sửa:**
  ```jsx
  // Trước
  setErrorModal({ isOpen: true, message: 'Vui lòng nhập tên' });
  
  // Sau
  setErrorModal({ isOpen: true, message: 'Please enter name' });
  ```

### 11. **Ẩn/Hiện Một Cột Trong Bảng**
**Ví dụ:** "Ẩn cột 'Mô tả' trong bảng"
- **File:** File trang đó
- **Tìm:** Phần định nghĩa columns của Table
- **Sửa:** Comment hoặc xóa dòng column đó
  ```jsx
  const columns = [
    { header: 'Tên', accessor: 'name' },
    // { header: 'Mô tả', accessor: 'description' }, // Ẩn cột này
    { header: 'Ngày', accessor: 'date' },
  ];
  ```

### 12. **Thay Đổi Default Value**
**Ví dụ:** "Mặc định chọn 'Tất cả' trong filter"
- **File:** File trang đó
- **Tìm:** `useState` của filter
- **Sửa:**
  ```jsx
  // Trước
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sau (nếu muốn mặc định là 'active')
  const [statusFilter, setStatusFilter] = useState('active');
  ```

---

## 🎨 Task Về UI (5-10 phút)

### 13. **Thay Đổi Spacing/Padding**
**Ví dụ:** "Tăng khoảng cách giữa các nút"
- **File:** File trang đó
- **Tìm:** Container chứa buttons
- **Sửa:**
  ```jsx
  // Trước
  <div className="flex gap-2">
  
  // Sau
  <div className="flex gap-4">
  // Hoặc
  <div className="flex space-x-4">
  ```

### 14. **Thay Đổi Font Size**
**Ví dụ:** "Làm tiêu đề to hơn"
- **File:** File trang đó
- **Tìm:** Heading
- **Sửa:**
  ```jsx
  // Trước
  <h1 className="text-2xl font-bold">Tiêu đề</h1>
  
  // Sau
  <h1 className="text-3xl font-bold">Tiêu đề</h1>
  // Hoặc text-4xl, text-5xl...
  ```

### 15. **Thêm Border/Shadow**
**Ví dụ:** "Thêm viền cho card"
- **File:** File trang đó
- **Tìm:** Card/Container
- **Sửa:**
  ```jsx
  // Trước
  <div className="bg-white rounded-lg p-4">
  
  // Sau
  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
  ```

### 16. **Thay Đổi Màu Background**
**Ví dụ:** "Đổi màu nền trang"
- **File:** File trang đó
- **Tìm:** Container chính
- **Sửa:**
  ```jsx
  // Trước
  <div className="bg-gray-50">
  
  // Sau
  <div className="bg-blue-50">
  // Hoặc bg-white, bg-gray-100...
  ```

---

## 📝 Task Về Logic Đơn Giản (7-10 phút)

### 17. **Thêm Required Field**
**Ví dụ:** "Làm field 'Tên' bắt buộc"
- **File:** File trang đó
- **Tìm:** Input field
- **Sửa:**
  ```jsx
  // Trước
  <Input
    value={formData.name}
    onChange={...}
  />
  
  // Sau
  <Input
    value={formData.name}
    onChange={...}
    required
  />
  // Và thêm validation trong handleSubmit
  ```

### 18. **Thay Đổi Format Hiển Thị**
**Ví dụ:** "Hiển thị số tiền với dấu phẩy"
- **File:** File trang đó
- **Tìm:** Nơi hiển thị số
- **Sửa:**
  ```jsx
  // Trước
  <td>{promotion.amount}</td>
  
  // Sau
  <td>{promotion.amount.toLocaleString('vi-VN')}</td>
  // Hoặc
  <td>{new Intl.NumberFormat('vi-VN').format(promotion.amount)}</td>
  ```

### 19. **Thay Đổi Format Ngày**
**Ví dụ:** "Hiển thị ngày theo format DD/MM/YYYY"
- **File:** File trang đó
- **Tìm:** Nơi hiển thị ngày
- **Sửa:**
  ```jsx
  // Trước
  <td>{promotion.startDate}</td>
  
  // Sau
  <td>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</td>
  ```

### 20. **Thêm Disabled State**
**Ví dụ:** "Disable nút khi đang loading"
- **File:** File trang đó
- **Tìm:** Button
- **Sửa:**
  ```jsx
  // Trước
  <Button onClick={handleSubmit}>Lưu</Button>
  
  // Sau
  <Button onClick={handleSubmit} disabled={isLoading}>
    {isLoading ? 'Đang lưu...' : 'Lưu'}
  </Button>
  ```

---

## 🎯 Checklist Khi Làm Task Nhanh

✅ **Bước 1:** Đọc yêu cầu → Xác định file cần sửa (2 phút)
✅ **Bước 2:** Tìm vị trí cần sửa bằng Ctrl+F (1 phút)
✅ **Bước 3:** Sửa code (2-5 phút)
✅ **Bước 4:** Lưu file → Kiểm tra console có lỗi không (1 phút)
✅ **Bước 5:** Test nhanh trên browser (1 phút)

---

## 💡 Tips Để Làm Nhanh

1. **Dùng Ctrl+F** để tìm text/keyword nhanh
2. **Dùng Ctrl+Click** vào component để jump đến file định nghĩa
3. **Dùng Multi-cursor** (Alt+Click) để sửa nhiều chỗ cùng lúc
4. **Copy-paste** code tương tự và chỉnh sửa
5. **Dùng Tailwind CSS classes** có sẵn, không cần viết CSS mới

---

## 🔥 Top 10 Task Thầy Hay Yêu Cầu Nhất

1. ✅ Thay đổi màu nút/badge
2. ✅ Thay đổi text/label
3. ✅ Thêm validation đơn giản
4. ✅ Thay đổi placeholder
5. ✅ Thay đổi số items per page
6. ✅ Thay đổi icon
7. ✅ Sửa message/alert
8. ✅ Thay đổi kích thước/spacing
9. ✅ Thêm/xóa một field đơn giản
10. ✅ Thay đổi format hiển thị (số, ngày)

---

## ⚠️ Lưu Ý

- **Đọc kỹ yêu cầu** trước khi code
- **Test ngay** sau khi sửa
- **Kiểm tra console** xem có lỗi không
- **Nếu không chắc**, hỏi lại thầy trước khi sửa

---

**Chúc bạn làm task nhanh và chính xác! 🚀**

