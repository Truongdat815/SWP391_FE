# 🐛 Debug: Loading Mãi Khi Tạo Đơn Hàng

## ✅ Đã Thêm Debug Logging

Tôi đã thêm **console logging chi tiết** vào toàn bộ flow tạo đơn hàng để xem lỗi gì đang xảy ra.

---

## 🔍 Cách Debug

### **Bước 1: Mở Developer Tools**

1. Nhấn **F12** hoặc **Ctrl + Shift + I** (Windows) / **Cmd + Option + I** (Mac)
2. Chọn tab **Console**
3. Giữ Console mở

### **Bước 2: Thử Tạo Đơn Hàng Lại**

1. Vào trang **Tạo Đơn Hàng**
2. Chọn khách hàng → Model → Màu & Số lượng
3. Bấm **"Xác nhận tạo đơn hàng"**
4. **Xem Console** → Sẽ thấy log như sau:

---

## 📊 Console Logs Bạn Sẽ Thấy

### **✅ Nếu Thành Công:**

```
🚀 Step 1: Creating order for customer: {...}
🌐 API Request: POST /api/orders/create { body: { customerId: 123 } }
📥 API Response: POST /api/orders/create { status: 200, data: {...} }
✅ Order created: {...}
📝 Extracted orderId: 456
🚀 Step 2: Creating order details: { orderId: 456, orderDetails: [...] }
🌐 API Request (Order Details): POST /api/order-details/create {...}
📥 API Response (Order Details): POST /api/order-details/create { status: 200, data: {...} }
✅ Order details created: {...}
```

### **❌ Nếu Có Lỗi:**

#### **Lỗi 401 (Unauthorized):**
```
🌐 API Request: POST /api/orders/create
❌ API Error: POST /api/orders/create { status: 401, message: "Unauthorized" }
❌ Error creating order: Unauthorized
```
**→ Giải pháp:** Đăng nhập lại

#### **Lỗi 403 (Forbidden):**
```
❌ API Error: POST /api/orders/create { status: 403, message: "Forbidden" }
```
**→ Giải pháp:** Kiểm tra role "Dealer Staff" có quyền gọi API này không

#### **Lỗi 400 (Bad Request):**
```
❌ API Error: POST /api/orders/create { status: 400, message: "Invalid request body" }
```
**→ Giải pháp:** Request body không đúng format

#### **Lỗi 500 (Server Error):**
```
❌ API Error: POST /api/orders/create { status: 500, message: "Internal Server Error" }
```
**→ Giải pháp:** Lỗi phía Backend

#### **Không nhận được orderId:**
```
✅ Order created: {...}
📝 Extracted orderId: undefined
❌ No orderId in response: {...}
❌ Error: Không nhận được orderId từ server
```
**→ Giải pháp:** Backend response không có field `orderId` hoặc `id`

---

## 🧪 Test Cases

### **Test 1: Check API Endpoints**

Mở **Network** tab trong DevTools:
1. Filter: `orders`
2. Tạo đơn hàng
3. Xem requests:
   - `POST /api/orders/create` → Status code?
   - `POST /api/order-details/create` → Status code?

**Nếu thấy:**
- ✅ **200/201**: Thành công
- ❌ **401**: Token hết hạn
- ❌ **403**: Không có quyền
- ❌ **400**: Request body sai
- ❌ **500**: Lỗi server
- ❌ **Pending/Cancel**: API không response (timeout/CORS)

### **Test 2: Check Token**

Console:
```javascript
console.log(localStorage.getItem('access_token'));
```

**Nếu:**
- ✅ Có token → OK
- ❌ `null` → Chưa login

### **Test 3: Check Request Body**

Trong Network tab:
1. Click vào request `POST /api/orders/create`
2. Tab **Payload** → Xem body đã gửi:
```json
{
  "customerId": 123
}
```

3. Click vào request `POST /api/order-details/create`
4. Tab **Payload** → Xem body:
```json
{
  "orderId": 456,
  "orderDetails": [
    {
      "modelId": 5,
      "colorId": 3,
      "quantity": 2,
      "customerId": 123
    }
  ]
}
```

**So sánh với Swagger schema!**

---

## 🎯 Các Lỗi Thường Gặp

### **1. API Không Response (Loading Mãi)**

**Nguyên nhân:**
- Backend không chạy
- CORS error
- Timeout
- Network issue

**Kiểm tra:**
```javascript
// Console
console.log(import.meta.env.VITE_API_URL);
// Hoặc
console.log(API_URL);
```

**Giải pháp:**
- Check backend server có đang chạy không
- Check URL đúng không
- Check CORS config

### **2. Lỗi 401 - Unauthorized**

**Nguyên nhân:**
- Token hết hạn
- Token không hợp lệ
- Chưa login

**Giải pháp:**
- Đăng nhập lại
- Clear localStorage: `localStorage.clear()`

### **3. Lỗi 403 - Forbidden**

**Nguyên nhân:**
- Role "Dealer Staff" không có quyền

**Giải pháp:**
- Kiểm tra Swagger: Endpoints có require quyền gì không?
- Kiểm tra Backend: Role config đúng không?

### **4. Không Nhận Được orderId**

**Nguyên nhân:**
- Backend response structure khác
- Có thể trả về `id` thay vì `orderId`
- Có thể trả về `{ code, message, data: { orderId } }`

**Giải pháp:**
Xem response trong Network tab để biết structure thực tế

**Code đã xử lý:**
```javascript
const orderId = orderData.orderId || orderData.id;
```

Nếu backend trả về khác, cần update code.

### **5. Request Body Sai Format**

**Kiểm tra Swagger:**

**POST /api/orders/create:**
```json
{
  "customerId": 123
}
```
✅ Code hiện tại đúng

**POST /api/order-details/create:**
```json
{
  "orderId": 456,
  "orderDetails": [
    {
      "modelId": 5,
      "colorId": 3,
      "quantity": 2,
      "customerId": 123
    }
  ]
}
```
✅ Code hiện tại đúng

Nhưng có thể Backend cần thêm fields như:
- `unitPrice`?
- `totalPrice`?
- `orderDate`?

→ **Check Swagger schema chi tiết!**

---

## 📝 Báo Lỗi Cho Tôi

Sau khi làm theo hướng dẫn trên, hãy **copy toàn bộ Console logs** và gửi cho tôi:

1. **Console logs** (tất cả messages có emoji 🚀📥❌)
2. **Network requests** (status codes)
3. **Request Payload** (body đã gửi)
4. **Response** (data nhận được)

Tôi sẽ biết chính xác lỗi gì và fix ngay!

---

## 🔧 Temporary Workaround

Nếu cần test nhanh, có thể:

### **Option 1: Test riêng từng API**

Console:
```javascript
// Test create order
fetch('http://your-api/api/orders/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  },
  body: JSON.stringify({ customerId: 123 })
})
.then(r => r.json())
.then(d => console.log('Order result:', d))
.catch(e => console.error('Error:', e));
```

### **Option 2: Check Swagger UI**

Vào Swagger UI trực tiếp:
1. `http://103.188.243.122:8888/swagger-ui/index.html`
2. Thử call API từ đó
3. Xem response structure

---

## ✅ Checklist Debug

- [ ] Mở Console & Network tab
- [ ] Thử tạo đơn hàng
- [ ] Check console logs
- [ ] Check network requests (status codes)
- [ ] Check request payloads
- [ ] Check responses
- [ ] Copy logs và báo cho developer

---

**LƯU Ý:** Tất cả logs giờ đã được thêm vào code. Chỉ cần refresh trang và thử lại!

