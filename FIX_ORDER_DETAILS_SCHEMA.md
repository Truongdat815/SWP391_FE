# 🔧 Fix Cuối Cùng: Schema Order Details

## ❌ Vấn Đề Thực Sự

Backend đang expect **`storeStockId`** chứ KHÔNG phải `modelId` + `colorId`!

---

## 📊 So Sánh Schema

### **❌ Request Body SAI (Trước):**
```json
{
  "orderId": 41,
  "orderDetails": [
    {
      "modelId": 5,
      "colorId": 3,
      "quantity": 2,
      "customerId": 1,
      "promotionId": 0
    }
  ]
}
```

### **✅ Request Body ĐÚNG (Sau):**
```json
{
  "orderId": 41,
  "orderDetails": [
    {
      "storeStockId": 1,    // ← Stock ID từ store_stocks
      "quantity": 2,
      "promotionId": 0
    }
  ]
}
```

---

## 🔍 Logic Giải Thích

### **Backend Design:**
- Bảng `order_details` có FK: `store_stock_id`
- **KHÔNG có** `model_id` và `color_id` trực tiếp
- Vì model + color đã được xác định trong `store_stocks`

### **Frontend Phải:**
1. Lấy danh sách `store_stocks` (đã có ✅)
2. Tìm `stockId` dựa trên `modelId` + `colorId`
3. Gửi `storeStockId` trong request

---

## ✅ Code Changes

### **1. Thêm Function Get StoreStockId:**
```javascript
const getStoreStockId = (modelId, colorId) => {
  const stock = storeStocks.find(s => 
    s.modelId === modelId && s.colorId === colorId
  );
  return stock ? stock.stockId : null;
};
```

### **2. Lưu StoreStockId Khi Add Item:**
```javascript
const handleAddItem = (color, quantity) => {
  // Get storeStockId
  const storeStockId = getStoreStockId(selectedModel.modelId, color.colorId);
  
  if (!storeStockId) {
    setError('Không tìm thấy thông tin kho!');
    return;
  }

  setSelectedItems([...selectedItems, {
    storeStockId: storeStockId,  // ← Lưu stockId
    modelId: selectedModel.modelId,
    colorId: color.colorId,
    modelName: selectedModel.modelName,
    colorName: color.colorName,
    quantity: quantity,
    unitPrice: selectedModel.price || 0
  }]);
};
```

### **3. Gửi Đúng Schema:**
```javascript
const orderDetailsPayload = {
  orderId: orderId,
  orderDetails: selectedItems.map(item => ({
    storeStockId: item.storeStockId,  // ← Chỉ gửi 3 fields
    quantity: item.quantity,
    promotionId: 0
  }))
};
```

---

## 🧪 Test Case

### **Data Flow:**

1. **User chọn:**
   - Model: Electra accent (modelId: 5)
   - Color: Đỏ (colorId: 3)
   - Quantity: 2

2. **Frontend tìm:**
   ```javascript
   storeStocks.find(s => s.modelId === 5 && s.colorId === 3)
   // → { stockId: 1, modelName: "Electra accent", colorName: "Đỏ", quantity: 6, ... }
   ```

3. **Gửi request:**
   ```json
   {
     "orderId": 41,
     "orderDetails": [
       {
         "storeStockId": 1,
         "quantity": 2,
         "promotionId": 0
       }
     ]
   }
   ```

4. **Backend xử lý:**
   - Lấy thông tin từ `store_stocks` WHERE stockId = 1
   - Lấy modelName, colorName, price...
   - Tạo order_detail record

---

## 📝 Files Changed

1. **`src/pages/dealerStaff/CreateOrder.jsx`**
   - Added: `getStoreStockId()` function
   - Modified: `handleAddItem()` - save storeStockId
   - Modified: `orderDetailsPayload` - send storeStockId

2. **`src/api/order-detailService.js`**
   - Updated: Comment to reflect correct schema

---

## ✅ Kết Quả Mong Đợi

Sau khi **refresh page** và test lại:

```
✅ Order created: orderId = 42
✅ Order details created successfully!
✅ Success message
✅ Redirect to view orders
✅ Đơn hàng hiển thị đầy đủ thông tin
```

---

## 🔍 Debug Tip

Nếu vẫn lỗi, check Console:
```
🚀 Step 2: Creating order details: {
  orderId: 42,
  orderDetails: [
    {
      storeStockId: 1,  // ← Phải là số, không phải undefined
      quantity: 2,
      promotionId: 0
    }
  ]
}
```

Nếu `storeStockId: undefined` → Check:
1. `storeStocks` có data không?
2. `modelId` và `colorId` có match không?
3. Console log để debug:
   ```javascript
   console.log('Finding stock for:', { modelId, colorId });
   console.log('Available stocks:', storeStocks);
   ```

---

## 🎉 TÓM TẮT

**Lỗi gốc:** Gửi sai schema (modelId + colorId thay vì storeStockId)

**Fix:** Lấy storeStockId từ store_stocks và gửi đúng format

**Lần này chắc chắn work rồi!** 🚀

