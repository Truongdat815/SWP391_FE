# Tooltip Implementation Guide - Electra System

## Overview
This document provides a comprehensive guide for the tooltip system implemented across the Electra application. Tooltips are added to all interactive elements to enhance user experience and provide contextual help.

## Tooltip Component

### Location
`src/components/ui/Tooltip.jsx`

### Features
- Built with `@floating-ui/react` for robust positioning
- Auto-positioning with flip and shift middleware
- Smooth transitions and animations
- Delay before showing (default: 300ms)
- Accessible with proper ARIA roles
- Portal rendering to avoid z-index issues

### Usage Example
```jsx
import Tooltip from '@/components/ui/Tooltip';

<Tooltip content="Thêm người dùng mới vào hệ thống" placement="bottom">
  <button onClick={handleAdd}>Thêm người dùng</button>
</Tooltip>
```

### Props
- `content` (string, required): The tooltip text
- `placement` (string, optional): Position - 'top', 'bottom', 'left', 'right' (default: 'top')
- `delay` (number, optional): Delay before showing in ms (default: 300)
- `disabled` (boolean, optional): Disable tooltip display (default: false)

## Button Component Enhancement

### Location
`src/components/ui/Button.jsx`

### Updated Features
The Button component now supports tooltip props directly:

```jsx
import Button from '@/components/ui/Button';

<Button 
  tooltip="Lưu thay đổi vào hệ thống" 
  tooltipPlacement="top"
  onClick={handleSave}
>
  Lưu
</Button>
```

### Props Added
- `tooltip` (string, optional): Tooltip text for the button
- `tooltipPlacement` (string, optional): Tooltip position (default: 'top')

## Implementation by Role

### 1. Admin Pages

#### UserManagement (`src/pages/admin/UserManagement.jsx`)
**Tooltips Added:**
- ✅ "Tạo tài khoản người dùng mới trong hệ thống" - Add User button
- ✅ "Xuất báo cáo danh sách người dùng ra file Excel" - Export button
- ✅ "Chỉnh sửa thông tin người dùng" - Edit button (table actions)
- ✅ "Xem chi tiết thông tin người dùng" - View button (table actions)
- ✅ "Xóa người dùng khỏi hệ thống" - Delete button (table actions)

#### StoreManagement (`src/pages/admin/StoreManagement.jsx`)
**Tooltips Added:**
- ✅ "Thêm cửa hàng mới vào hệ thống" - Add Store button
- ✅ "Xuất báo cáo danh sách cửa hàng ra file Excel" - Export button
- ✅ "Chỉnh sửa thông tin cửa hàng" - Edit button (table actions)
- ✅ "Xóa cửa hàng khỏi hệ thống" - Delete button (table actions)
- ✅ "Xem chi tiết thông tin cửa hàng" - View button (table actions)

### 2. Dealer Staff Pages

#### CustomerManagement (`src/pages/dealerStaff/CustomerManagement.jsx`)
**Tooltips Added:**
- ✅ "Thêm khách hàng mới vào hệ thống" - Add Customer button
- ✅ "Xuất danh sách khách hàng ra file Excel" - Export button

#### CreateOrder (`src/pages/dealerStaff/CreateOrder.jsx`)
**Tooltips Added:**
- ✅ "Thêm khách hàng mới nếu chưa có trong hệ thống" - Add Customer button

### 3. Common Components

#### ProductCard (`src/components/ProductCard.jsx`)
**Tooltips Added:**
- ✅ "Xem thông tin chi tiết về mẫu xe này" - View button (overlay)
- ✅ "Chỉnh sửa thông tin mẫu xe" - Edit button (overlay)
- ✅ "Xem thông số kỹ thuật đầy đủ và mô tả chi tiết" - Details button
- ✅ "Chỉnh sửa thông tin và thông số của mẫu xe" - Edit button
- ✅ "Xóa mẫu xe này khỏi hệ thống" - Delete button

#### DealerCard (`src/components/DealerCard.jsx`)
**Tooltips Added:**
- ✅ "Xem thông tin chi tiết, sản phẩm và dịch vụ của đại lý" - View Details link

#### Navbar (`src/components/Navbar.jsx`)
**Tooltips Added:**
- ✅ "Đăng nhập vào hệ thống quản lý Electra" - Login button

## Tooltip Content Guidelines

### Best Practices
1. **Be Descriptive**: Clearly explain what the action does
2. **Use Action Verbs**: Start with verbs like "Thêm", "Xóa", "Xem", "Chỉnh sửa"
3. **Keep It Concise**: One sentence maximum
4. **User-Friendly Language**: Avoid technical jargon
5. **Consistent Tone**: Maintain a helpful, friendly tone

### Examples of Good Tooltip Content

**✅ Good Examples:**
- "Tạo đơn hàng mới cho khách hàng"
- "Chỉnh sửa thông tin khách hàng"
- "Xóa lịch hẹn lái thử"
- "Kiểm tra tồn kho xe"
- "Gửi phản hồi cho phòng hỗ trợ"
- "So sánh tối đa 3 xe về thông số kỹ thuật"
- "Xem chi tiết hợp đồng và trạng thái thanh toán"
- "Hiển thị biểu đồ doanh số theo tháng"

**❌ Bad Examples:**
- "Click here" - Too vague
- "Button" - States the obvious
- "This will delete the user from the database permanently and cannot be undone" - Too long
- "CRUD operation" - Technical jargon

## Implementation Pattern

### For Interactive Buttons
```jsx
<Tooltip content="Descriptive action text" placement="top">
  <button onClick={handleAction}>
    <Icon />
    Button Text
  </button>
</Tooltip>
```

### For Icon-Only Buttons
```jsx
<Tooltip content="What this icon does" placement="top">
  <button className="icon-button">
    <Icon />
  </button>
</Tooltip>
```

### For Links
```jsx
<Tooltip content="Where this link goes and what happens" placement="bottom">
  <Link to="/path">Link Text</Link>
</Tooltip>
```

### For Status Indicators
```jsx
<Tooltip content="What this status means" placement="right">
  <span className="status-badge">Active</span>
</Tooltip>
```

## Remaining Implementation Areas

### Dealer Manager Pages (To Be Completed)
- [ ] InventoryManagement
- [ ] QuanLyNhanVien
- [ ] BaoCaoDoanhSo
- [ ] TaoBaoCao
- [ ] XuatBaoCao
- [ ] QuanLyCongNo

### EVM Staff Pages (To Be Completed)
- [ ] ProductManagement
- [ ] VehicleManagement
- [ ] DealerOrderManagement
- [ ] SalesReport

### Dealer Staff Pages (Remaining)
- [ ] ViewOrders
- [ ] CarListing
- [ ] TestDriveSchedule
- [ ] PaymentManagement
- [ ] FeedbackManagement
- [ ] QuoteOrderManagement
- [ ] Inventory

### Public Pages (To Be Completed)
- [ ] Home
- [ ] CarDetail
- [ ] CarListing (public)
- [ ] Dealers
- [ ] DealerDetail

### Common Components (Remaining)
- [ ] Footer
- [ ] Hero
- [ ] Models
- [ ] About
- [ ] Specs
- [ ] NewsSection

## Mobile Considerations

For mobile devices, tooltips may not work well with hover. Consider:
1. Using `touch` events for mobile
2. Showing tooltips on long-press
3. Alternative UI patterns for critical information on mobile
4. The current implementation uses focus events which work on mobile when elements are tapped

## Accessibility

The Tooltip component follows accessibility best practices:
- Uses proper ARIA role="tooltip"
- Dismissible with Escape key
- Focus-aware (shows on focus)
- Keyboard navigable
- Proper z-index to avoid overlap issues

## Testing Checklist

When adding tooltips to a page:
- [ ] All action buttons have tooltips
- [ ] All icon buttons have tooltips
- [ ] Tooltip content is clear and descriptive
- [ ] Placement doesn't obstruct important UI elements
- [ ] Works on hover
- [ ] Works on keyboard focus
- [ ] Tooltips dismiss properly
- [ ] No layout shift when tooltip appears
- [ ] Consistent with other tooltips in the system

## Updates and Maintenance

**Last Updated:** October 26, 2025
**Status:** In Progress - Core components implemented, remaining pages in progress

### Change Log
- ✅ Created Tooltip component with @floating-ui/react
- ✅ Updated Button component to support tooltips
- ✅ Implemented tooltips in Admin pages (UserManagement, StoreManagement)
- ✅ Implemented tooltips in Dealer Staff pages (CustomerManagement, CreateOrder)
- ✅ Implemented tooltips in Common components (ProductCard, DealerCard, Navbar)
- ⏳ Dealer Manager pages - In Progress
- ⏳ EVM Staff pages - In Progress
- ⏳ Public pages - In Progress
- ⏳ Remaining common components - In Progress

### Next Steps
1. Continue implementing tooltips in Dealer Manager pages
2. Add tooltips to EVM Staff pages
3. Add tooltips to all public-facing pages
4. Add tooltips to remaining common components
5. Conduct user testing for tooltip effectiveness
6. Review and refine tooltip content based on user feedback

## Support

For questions or issues related to the tooltip implementation:
- Check this guide first
- Review the Tooltip component code in `src/components/ui/Tooltip.jsx`
- Refer to existing implementations in completed pages
- Follow the patterns and examples provided

---

**Note:** This is a living document. Update it as new pages are completed and new patterns emerge.


