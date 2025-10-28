# 🎯 Hướng Dẫn Quản Lý Khuyến Mãi - Dealer Manager

## 📋 Tổng Quan

Trang **Quản Lý Khuyến Mãi** cho phép Dealer Manager tạo và quản lý các chương trình khuyến mãi cho sản phẩm xe điện. Các khuyến mãi được tạo sẽ có thể được Dealer Staff áp dụng khi tạo đơn hàng.

## 🚀 Truy Cập

**URL:** `/dealer-manager/promotion-management`

**Menu:** Sidebar → "Quản lý khuyến mãi" (icon 🏷️)

**Quyền truy cập:** Chỉ Dealer Manager

## ✨ Tính Năng

### 1. **Dashboard Thống Kê**

Hiển thị 4 cards thống kê:
- 📊 **Tổng khuyến mãi**: Tổng số chương trình
- ✅ **Đang áp dụng**: Số khuyến mãi đang hoạt động
- 📈 **Giảm giá %**: Số khuyến mãi theo phần trăm
- 💰 **Giảm cố định**: Số khuyến mãi giảm số tiền cố định

### 2. **Bộ Lọc Nâng Cao**

```
┌─────────────────────────────────────────────┐
│ [🔍 Tìm kiếm...]  [📊 Trạng thái]  [📈 Loại] │
└─────────────────────────────────────────────┘
```

- **Tìm kiếm**: Tìm theo tên hoặc mô tả khuyến mãi
- **Trạng thái**: 
  - Tất cả
  - Đang áp dụng (active + trong khoảng thời gian)
  - Không hoạt động
- **Loại**: 
  - Tất cả
  - Giảm theo % (PERCENTAGE)
  - Giảm cố định (FIXED_AMOUNT)

### 3. **Bảng Danh Sách**

| Cột | Mô tả |
|-----|-------|
| **Tên khuyến mãi** | Tên + Mô tả ngắn (50 ký tự) |
| **Loại & Giá trị** | Icon + Giá trị (%, đ) |
| **Thời gian** | Ngày bắt đầu → Ngày kết thúc |
| **Model** | Tên model hoặc "Tất cả" |
| **Trạng thái** | Badge màu (Sắp diễn ra, Đang áp dụng, Hết hạn, Vô hiệu hóa) |
| **Thao tác** | 👁️ Xem, ✏️ Sửa, 🗑️ Xóa |

### 4. **Trạng Thái Badge**

```
🔵 Sắp diễn ra    - Chưa đến ngày bắt đầu
✅ Đang áp dụng   - Trong khoảng thời gian & active=true
❌ Hết hạn        - Quá ngày kết thúc
⚫ Vô hiệu hóa     - active=false
```

## 🛠️ Các Thao Tác

### ➕ Tạo Khuyến Mãi Mới

**Button:** "Tạo Khuyến Mãi" (góc trên bên phải)

**Form Fields:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| **Tên khuyến mãi** | Text | ✅ | VD: "Giảm giá mùa hè" |
| **Mô tả** | Textarea | ❌ | Chi tiết về chương trình |
| **Loại khuyến mãi** | Select | ✅ | PERCENTAGE / FIXED_AMOUNT |
| **Giá trị** | Number | ✅ | % (0-100) hoặc VNĐ |
| **Ngày bắt đầu** | Date | ✅ | Thời gian bắt đầu |
| **Ngày kết thúc** | Date | ✅ | Thời gian kết thúc (≥ ngày bắt đầu) |
| **Model** | Select | ❌ | "Tất cả" hoặc chọn model cụ thể |
| **Kích hoạt ngay** | Checkbox | ❌ | Default: checked |

**Example:**
```
Tên: Khuyến mãi Tết 2025
Mô tả: Giảm giá đặc biệt dịp Tết Nguyên Đán
Loại: PERCENTAGE
Giá trị: 15
Ngày bắt đầu: 2025-01-20
Ngày kết thúc: 2025-02-10
Model: Electra Ascent
Kích hoạt: ✓
```

**API Call:**
```javascript
POST /api/promotions/create
{
  "promotionName": "Khuyến mãi Tết 2025",
  "description": "Giảm giá đặc biệt dịp Tết Nguyên Đán",
  "promotionType": "PERCENTAGE",
  "amount": 15,
  "startDate": "2025-01-20",
  "endDate": "2025-02-10",
  "modelId": 1,
  "active": true
}
```

### ✏️ Chỉnh Sửa Khuyến Mãi

1. Click icon **Edit** (✏️) trên dòng khuyến mãi
2. Modal hiện ra với data đã điền sẵn
3. Chỉnh sửa các field cần thiết
4. Click "Cập Nhật"

**API Call:**
```javascript
PUT /api/promotions/{promotionId}
```

### 👁️ Xem Chi Tiết

**Modal hiển thị:**
- Tên + Mô tả đầy đủ
- Loại khuyến mãi (với icon)
- Giá trị (format đẹp)
- Timeline (start → end)
- Model áp dụng
- Trạng thái kích hoạt

**Button:**
- "Đóng"
- "Chỉnh Sửa" (chuyển sang Edit modal)

### 🗑️ Xóa Khuyến Mãi

1. Click icon **Trash** (🗑️)
2. Confirmation modal hiện ra
3. Xác nhận "Xóa"

**API Call:**
```javascript
DELETE /api/promotions/{promotionId}
```

## 📊 Cách Tính Trạng Thái

```javascript
function getStatus(promotion) {
  if (!promotion.active) return "Vô hiệu hóa";
  
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  
  if (now < start) return "Sắp diễn ra";
  if (now > end) return "Hết hạn";
  return "Đang áp dụng";
}
```

## 💰 Cách Áp Dụng Khuyến Mãi

### Trong AddOrderDetails.jsx

```javascript
// 1. Load promotions
useEffect(() => {
  dispatch(fetchActivePromotions());
}, []);

// 2. Select promotion
<select onChange={handlePromotionChange}>
  {activePromotions.map(promo => (
    <option value={promo.promotionId}>
      {promo.promotionName} - {formatAmount(promo.amount, promo.promotionType)}
    </option>
  ))}
</select>

// 3. Calculate discount
const discount = selectedPromotion?.promotionType === 'PERCENTAGE'
  ? (unitPrice * selectedPromotion.amount) / 100
  : selectedPromotion.amount;

// 4. Apply to order detail
const detailData = {
  ...otherFields,
  promotionId: selectedPromotion?.promotionId || 0,
  discountAmount: discount
};
```

## 🎨 UI/UX Features

### Loading States
- Skeleton loader khi fetch data
- Button disabled + spinner khi submit
- Smooth transitions

### Error Handling
- Alert banner tự động hide sau 5s
- Form validation
- API error messages hiển thị rõ ràng

### Success Messages
- Auto-hide sau 3s
- Green notification banner
- Smooth animation (framer-motion)

### Responsive Design
- Mobile-friendly
- Tablet optimized
- Desktop full features

### Animations
- Modal fade-in/scale
- Alert slide-in/out
- Hover effects
- Smooth transitions

## 🔄 Redux Integration

### Actions Used

```javascript
import {
  fetchPromotions,           // Load all
  fetchActivePromotions,     // Load active only
  createNewPromotion,        // Create
  updatePromotionById,       // Update
  deletePromotionById,       // Delete
  clearError,                // Clear error state
  clearSuccess               // Clear success state
} from '../../store/slices/promotionSlice';
```

### State Structure

```javascript
{
  promotions: [],           // All promotions
  activePromotions: [],     // Filtered active ones
  selectedPromotion: null,  // Current selection
  loading: false,
  error: null,
  success: null
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Stack stats cards
  - Single column filters
  - Compact table
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - 2-column stats
  - Grid filters
  - Scrollable table
}

/* Desktop */
@media (min-width: 1025px) {
  - 4-column stats
  - 3-column filters
  - Full table width
}
```

## 🎯 Best Practices

### 1. **Naming Convention**
```
✅ Good: "Giảm giá mùa hè 2025"
❌ Bad: "KM_01", "Promotion 1"
```

### 2. **Date Range**
```
✅ Good: Start < End, reasonable duration
❌ Bad: End < Start, same date for start/end
```

### 3. **Discount Amount**
```
✅ PERCENTAGE: 5-50% (reasonable range)
✅ FIXED_AMOUNT: Multiple of 100,000đ
❌ PERCENTAGE: 100% (too high)
❌ FIXED_AMOUNT: Odd numbers like 12,345đ
```

### 4. **Model Selection**
```
✅ Use "Tất cả" (modelId=0) for store-wide promotions
✅ Use specific model for targeted promotions
❌ Create duplicate promotions for each model
```

### 5. **Active Status**
```
✅ Set active=true for immediate use
✅ Set active=false for future/draft promotions
❌ Create overlapping promotions for same model
```

## 🐛 Common Issues & Solutions

### Issue 1: Khuyến mãi không hiển thị
**Nguyên nhân:** 
- `active = false`
- Ngoài khoảng thời gian
- Filter không đúng

**Giải pháp:**
- Check trạng thái active
- Verify date range
- Reset filter về "Tất cả"

### Issue 2: Không tính được discount
**Nguyên nhân:**
- promotionId = null trong order detail
- Promotion không active

**Giải pháp:**
- Luôn set promotionId = 0 nếu không có promotion
- Check status trước khi apply

### Issue 3: API 400 Bad Request
**Nguyên nhân:**
- Missing required fields
- Invalid date format
- Amount out of range

**Giải pháp:**
- Validate form trước khi submit
- Use date picker (YYYY-MM-DD format)
- Set min/max for amount input

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/promotions/all` | Lấy tất cả |
| GET | `/api/promotions/{name}` | Lấy theo tên |
| POST | `/api/promotions/create` | Tạo mới |
| PUT | `/api/promotions/{id}` | Cập nhật |
| DELETE | `/api/promotions/{id}` | Xóa |

## 🎓 Technical Stack

- **Frontend:** React 18 + Hooks
- **State Management:** Redux Toolkit
- **UI Library:** Tailwind CSS
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Form:** Native HTML5 validation
- **Date:** Native date input

## ✅ Testing Checklist

- [ ] Tạo khuyến mãi PERCENTAGE
- [ ] Tạo khuyến mãi FIXED_AMOUNT
- [ ] Edit khuyến mãi
- [ ] Delete khuyến mãi
- [ ] View detail
- [ ] Search functionality
- [ ] Status filter
- [ ] Type filter
- [ ] Apply promotion in order
- [ ] Check discount calculation
- [ ] Responsive on mobile
- [ ] Error handling
- [ ] Success messages

## 🚀 Next Steps

1. Test full flow: Tạo → Edit → Delete
2. Tích hợp với AddOrderDetails.jsx
3. Verify discount calculation
4. Test edge cases (date overlap, duplicate names)
5. Deploy to production

---

**🎉 Hoàn tất! Trang Quản Lý Khuyến Mãi đã sẵn sàng sử dụng!**

**Access:** `/dealer-staff/promotion-management`

