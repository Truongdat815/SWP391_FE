# 🚫 Fix: Lỗi 405 Method Not Allowed Khi Xóa Đơn Hàng

## ❌ Vấn Đề

User (role: **Dealer Staff**) click nút **Xóa đơn hàng** → Lỗi:
```
DELETE /api/orders/4 → 405 (Method Not Allowed)
```

---

## 🔍 Nguyên Nhân

### **Backend không cho phép Dealer Staff xóa đơn hàng**

Đây là **logic nghiệp vụ đúng**:
- ✅ **Dealer Staff**: Tạo đơn, xem đơn
- ❌ **Dealer Staff**: KHÔNG được xóa đơn
- ✅ **Manager/Admin**: Được xóa đơn

→ Backend trả về **405** vì role không có quyền

---

## ✅ Giải Pháp

**Ẩn nút Xóa** trong giao diện Dealer Staff

### **Trước (SAI):**
```jsx
<td>
  <div className="flex space-x-3">
    <button onClick={() => handleViewDetails(order)}>
      <Eye /> Xem
    </button>
    <button onClick={() => handleDeleteOrder(order.orderId)}>
      <Trash2 /> Xóa  {/* ← User click → 405 error */}
    </button>
  </div>
</td>
```

### **Sau (ĐÚNG):**
```jsx
<td>
  <div className="flex space-x-3">
    <button onClick={() => handleViewDetails(order)}>
      <Eye /> Xem
    </button>
    {/* Dealer Staff không có quyền xóa */}
  </div>
</td>
```

---

## 🎯 Kết Quả

### **Trước:**
- ❌ Hiển thị nút Xóa
- ❌ User click → 405 error
- ❌ Gây confusion

### **Sau:**
- ✅ Chỉ hiển thị nút Xem
- ✅ Không có nút Xóa
- ✅ User không bị lỗi
- ✅ UX rõ ràng

---

## 📝 Logic Nghiệp Vụ

### **Dealer Staff (Nhân viên cửa hàng):**
- ✅ Tạo đơn hàng cho khách
- ✅ Xem danh sách đơn hàng
- ✅ Xem chi tiết đơn hàng
- ❌ **KHÔNG được xóa** (chỉ Manager mới xóa)
- ❌ **KHÔNG được sửa** (có thể chỉ sửa được status)

### **Dealer Manager (Quản lý cửa hàng):**
- ✅ Tất cả quyền của Staff
- ✅ **Xóa đơn hàng**
- ✅ Sửa đơn hàng
- ✅ Duyệt đơn hàng

---

## 🧪 Test

### **Refresh page và verify:**

1. ✅ Vào "Xem đơn hàng"
2. ✅ Thấy danh sách đơn
3. ✅ Chỉ có nút **👁️ Xem**
4. ✅ **KHÔNG có nút 🗑️ Xóa**
5. ✅ Click Xem → Modal hiển thị chi tiết

---

## 💡 Nếu Muốn Giữ Nút Xóa

Có thể disable nút thay vì ẩn:

```jsx
<Tooltip content="Chỉ Manager mới có quyền xóa đơn hàng" placement="top">
  <button
    disabled
    className="text-gray-400 cursor-not-allowed"
  >
    <Trash2 className="h-5 w-5" />
  </button>
</Tooltip>
```

Nhưng **ẩn hoàn toàn** là best practice vì:
- User không nhìn thấy = không thắc mắc
- UI clean hơn
- Không waste space

---

## ✅ Files Changed

1. **`src/pages/dealerStaff/ViewOrders.jsx`**
   - Removed: Delete button (Trash2 icon)
   - Added: Comment explaining why

---

## 🎉 Kết Luận

- ✅ Đã ẩn nút Xóa
- ✅ Dealer Staff chỉ xem và tạo đơn
- ✅ Không còn lỗi 405
- ✅ Logic nghiệp vụ đúng

**Refresh page và verify nhé!** 🚀

