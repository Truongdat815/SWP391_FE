# Luồng Tạo Đơn Hàng - Hợp Đồng - Thanh Toán

## Tổng Quan

Luồng xử lý đơn hàng trong hệ thống bao gồm 3 giai đoạn chính:
1. **Tạo Đơn Hàng** (Order Creation)
2. **Tạo Hợp Đồng** (Contract Creation)
3. **Thanh Toán** (Payment Processing)

---

## 📋 PHẦN 1: TẠO ĐƠN HÀNG (ORDER CREATION)

### Luồng Chi Tiết

#### Bước 1: Tạo Order Mới (DRAFT)
**File:** `src/pages/dealerStaff/CreateOrder.jsx`

**API được gọi:**
```
POST /api/orders/create
```

**Request Body:**
```json
{
  "customerId": number
}
```

**Response:**
```json
{
  "orderId": number,
  "orderCode": string,
  "status": "DRAFT",
  "customerId": number,
  ...
}
```

**Code thực hiện:**
- Khi người dùng chọn khách hàng và bắt đầu tạo đơn
- Tạo order với trạng thái `DRAFT` (nháp)
- Lưu `orderId` vào state để sử dụng cho các bước tiếp theo

---

#### Bước 2: Thêm Sản Phẩm vào Đơn (Order Details)

**API được gọi:**
```
POST /api/orders/create/quote
```

**Request Body:**
```json
{
  "orderId": number,
  "orderDetails": [
    {
      "modelId": number,
      "colorId": number,
      "quantity": number,
      "promotionId": number (optional, default: 0)
    }
  ],
  "includeLicensePlateService": boolean
}
```

**Response:**
```json
{
  "orderId": number,
  "orderCode": string,
  "status": "DRAFT",
  "totalPrice": number,
  "totalTaxPrice": number,
  "totalPromotionAmount": number,
  "totalPayment": number,
  "getOrderDetailsResponses": [
    {
      "orderDetailId": number,
      "modelId": number,
      "modelName": string,
      "colorId": number,
      "colorName": string,
      "quantity": number,
      "unitPrice": number,
      "vatAmount": number,
      "licensePlateFee": number,
      "registrationFee": number,
      "discountAmount": number,
      "totalPrice": number,
      "promotionId": number,
      "promotionName": string
    }
  ]
}
```

**Chức năng:**
- Backend tự động tính toán giá:
  - Giá đơn vị (unitPrice)
  - VAT (vatAmount)
  - Phí đăng ký biển số (licensePlateFee)
  - Phí đăng ký (registrationFee)
  - Giảm giá từ khuyến mãi (discountAmount)
  - Tổng giá (totalPrice)
- Có thể tạo nhiều order details trong một lần gọi (batch)

**File liên quan:**
- `src/api/order-detailService.js` - Function `createOrderDetailsInBatch()`
- `src/pages/dealerStaff/CreateOrder.jsx` - Function `handleContinueToConfirm()`

---

#### Bước 3: Xác Nhận Đơn Hàng (DRAFT → CONFIRMED)

**API được gọi:**
```
PUT /api/orders/{orderId}/confirm
```

**Request Body:**
```json
{
  "orderId": number
}
```

**Response:**
```json
{
  "orderId": number,
  "orderCode": string,
  "status": "CONFIRMED",
  "totalPrice": number,
  "totalTaxPrice": number,
  "totalPromotionAmount": number,
  "totalPayment": number,
  "getOrderDetailsResponses": [...],
  ...
}
```

**Chức năng:**
- Chuyển trạng thái đơn hàng từ `DRAFT` → `CONFIRMED`
- Đơn hàng đã được xác nhận, sẵn sàng để tạo hợp đồng

**File liên quan:**
- `src/api/orderService.js` - Function `confirmOrder()`
- `src/store/slices/orderSlice.js` - Thunk `confirmOrderThunk`
- `src/pages/dealerStaff/CreateOrder.jsx` - Function `executeConfirmOrder()`

---

### Các API Khác Liên Quan Đến Order

#### Lấy Danh Sách Đơn Hàng
```
GET /api/orders/all
```

#### Lấy Đơn Hàng Theo ID
```
GET /api/orders/{orderId}
```

#### Lấy Đơn Hàng Theo Trạng Thái
```
GET /api/orders/status/{status}
```

#### Lấy Đơn Hàng Theo Khoảng Thời Gian
```
GET /api/orders/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

#### Cập Nhật Trạng Thái Đơn Hàng
```
PATCH /api/orders/{orderId}/status
Body: { "status": "string" }
```

#### Giao Hàng (DELIVERED)
```
PUT /api/orders/{orderId}/deliver
```

---

## 📄 PHẦN 2: TẠO HỢP ĐỒNG (CONTRACT CREATION)

### Điều Kiện Tiên Quyết

Đơn hàng phải có trạng thái:
- `CONFIRMED` 


**Lưu ý:** Cần kiểm tra logic backend để xác định chính xác điều kiện.

---

### Luồng Tạo Hợp Đồng

#### Bước 1: Kiểm Tra Điều Kiện
- Đơn hàng phải có trạng thái `CONFIRMED`
- Đơn hàng chưa có hợp đồng (chưa có `contractId`)

#### Bước 2: Tạo Hợp Đồng

**API được gọi:**
```
POST /api/contracts/contracts
```

**Request Body:**
```json
{
  "orderId": number
}
```

**Response:**
```json
{
  "contractId": number,
  "contractCode": string,
  "orderId": number,
  "viewUrl": string,  // URL để xem hợp đồng HTML
  "message": "Tạo hợp đồng thành công!"
}
```

**Chức năng:**
- Backend tự động tạo hợp đồng từ thông tin đơn hàng
- Tạo mã hợp đồng (contractCode)
- Tạo file HTML hợp đồng
- Liên kết hợp đồng với đơn hàng



### Các API Khác Liên Quan Đến Contract

#### Lấy Tất Cả Hợp Đồng
```
GET /api/contracts/all
```

#### Lấy Hợp Đồng Theo ID
```
GET /api/contracts/{contractId}
```

#### Lấy Chi Tiết Hợp Đồng
```
GET /api/contracts/detail/{contractId}
```

#### Lấy HTML Hợp Đồng (Để In/Xem)
```
GET /api/contracts/{contractId}
```
**Response:** HTML content (text/html)

#### Upload Hợp Đồng Đã Ký
```
POST /api/contracts/{contractId}/upload-signed
Content-Type: multipart/form-data
Body: FormData với file (PDF/Image)
```

**Response:**
```json
{
  "contractId": number,
  "signedContractFileUrl": string,
  "code": number,
  "message": string
}
```

---

## 💳 PHẦN 3: THANH TOÁN (PAYMENT PROCESSING)

### Điều Kiện Tiên Quyết

- Hợp đồng đã được tạo (`contractId` tồn tại)
- Hợp đồng đã được ký (có `signedContractFileUrl` - tùy chọn, có thể không bắt buộc)

---

### Luồng Thanh Toán

#### Bước 1: Tạo Thanh Toán

**API được gọi:**
```
POST /api/payment/create
```

**Request Body:**
```json
{
  "contractId": number,
  "paymentType": "DEPOSIT" | "BALANCE",
  "paymentMethod": "VNPAY" | "CASH"
}
```

**Giải thích:**
- `paymentType`:
  - `DEPOSIT`: Đặt cọc (thường là 30% tổng giá trị)
  - `BALANCE`: Thanh toán số dư còn lại
- `paymentMethod`:
  - `VNPAY`: Thanh toán online qua VNPay
  - `CASH`: Thanh toán tiền mặt

**Response (VNPAY):**
```json
{
  "paymentId": number,
  "paymentUrl": string,  // URL để redirect đến VNPay
  "contractId": number,
  "paymentType": "DEPOSIT" | "BALANCE",
  "paymentMethod": "VNPAY",
  "amount": number,
  "status": "PENDING"
}
```

**Response (CASH):**
```json
{
  "paymentId": number,
  "contractId": number,
  "paymentType": "DEPOSIT" | "BALANCE",
  "paymentMethod": "CASH",
  "amount": number,
  "status": "COMPLETED" | "SUCCESS"
}
```

**Xử lý:**
- Nếu `paymentMethod = "VNPAY"`:
  - Nhận `paymentUrl` từ response
  - Redirect người dùng đến URL VNPay để thanh toán
  - VNPay sẽ callback về hệ thống sau khi thanh toán xong
- Nếu `paymentMethod = "CASH"`:
  - Thanh toán được ghi nhận ngay lập tức
  - Status thường là `COMPLETED` hoặc `SUCCESS`

**File liên quan:**
- `src/api/paymentService.js` - Function `createPayment()`
- `src/pages/dealerStaff/PaymentManagement.jsx` - Function `handleCreatePayment()`

---

#### Bước 2: Xử Lý Callback (VNPay)

Sau khi thanh toán qua VNPay, VNPay sẽ redirect về với các tham số:
- `paymentId`: ID của payment
- `status`: Trạng thái thanh toán
- `vnpResponseCode`: Mã phản hồi từ VNPay (00 = thành công)

**Xử lý:**
- Kiểm tra `vnpResponseCode === '00'` → Thanh toán thành công
- Cập nhật trạng thái payment trong hệ thống
- Refresh danh sách payments và contracts

---

#### Bước 3: Lấy Thông Tin Thanh Toán

**API được gọi:**
```
GET /api/payment/{paymentId}
```

**Response:**
```json
{
  "paymentId": number,
  "contractId": number,
  "contractCode": string,
  "paymentType": "DEPOSIT" | "BALANCE",
  "paymentMethod": "VNPAY" | "CASH",
  "amount": number,
  "status": "PENDING" | "COMPLETED" | "SUCCESS" | "FAILED",
  "createdAt": string,
  "updatedAt": string,
  ...
}
```

---

### Các API Khác Liên Quan Đến Payment

#### Lấy Tất Cả Payments
```
GET /api/payment/all
```

**Response:**
```json
[
  {
    "paymentId": number,
    "contractId": number,
    "paymentType": string,
    "paymentMethod": string,
    "amount": number,
    "status": string,
    ...
  },
  ...
]
```

---

## 🔄 SƠ ĐỒ LUỒNG TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                   1. TẠO ĐƠN HÀNG                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ POST /orders/    │
                    │ create           │
                    │ Status: DRAFT    │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ POST /orders/   │
                    │ create/quote    │
                    │ (Thêm sản phẩm) │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ PUT /orders/    │
                    │ {id}/confirm    │
                    │ Status:         │
                    │ CONFIRMED       │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   2. TẠO HỢP ĐỒNG                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ POST /contracts │
                    │ /contracts      │
                    │ (Từ orderId)    │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Upload hợp đồng │
                    │ đã ký (optional)│
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. THANH TOÁN                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ POST /payment/  │
                    │ create          │
                    │ (Từ contractId) │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │   VNPAY      │    │    CASH      │
          │ (Online)     │    │ (Tiền mặt)   │
          └──────────────┘    └──────────────┘
                    │                   │
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │ Callback từ  │    │ Status:      │
          │ VNPay        │    │ COMPLETED    │
          └──────────────┘    └──────────────┘
                    │
                    ▼
          ┌──────────────┐
          │ GET /payment │
          │ /{paymentId} │
          │ (Kiểm tra)   │
          └──────────────┘
```

---

## 📊 TRẠNG THÁI ĐƠN HÀNG (ORDER STATUS)

| Trạng Thái | Mô Tả | Có Thể Làm Gì Tiếp |
|------------|-------|-------------------|
| `DRAFT` | Nháp | - Thêm/sửa/xóa sản phẩm<br>- Xác nhận đơn hàng |
| `CONFIRMED` | Đã xác nhận | - Tạo hợp đồng<br>- Không thể sửa đơn hàng |
| `APPROVED` | Đã phê duyệt | - Tạo hợp đồng (theo một số nơi) |
| `DELIVERED` | Đã giao hàng | - Hoàn tất quy trình |

---

## 📊 TRẠNG THÁI THANH TOÁN (PAYMENT STATUS)

| Trạng Thái | Mô Tả |
|------------|-------|
| `PENDING` | Đang chờ thanh toán (VNPay) |
| `COMPLETED` | Đã hoàn thành |
| `SUCCESS` | Thành công |
| `FAILED` | Thất bại |

---

## 📊 LOẠI THANH TOÁN (PAYMENT TYPE)

| Loại | Mô Tả | Thời Điểm |
|------|-------|-----------|
| `DEPOSIT` | Đặt cọc | Thường là 30% tổng giá trị, thanh toán khi tạo hợp đồng |
| `BALANCE` | Thanh toán số dư | Phần còn lại sau khi đã đặt cọc |

---

## 🔑 CÁC FILE QUAN TRỌNG

### API Services
- `src/api/orderService.js` - Tất cả API liên quan đến Order
- `src/api/order-detailService.js` - API cho Order Details
- `src/api/contractService.js` - API cho Contract
- `src/api/paymentService.js` - API cho Payment

### Redux Slices
- `src/store/slices/orderSlice.js` - State management cho Order
- `src/store/slices/contractSlice.js` - State management cho Contract

### Pages/Components
- `src/pages/dealerStaff/CreateOrder.jsx` - Tạo và xác nhận đơn hàng
- `src/pages/dealerStaff/OrderSummary.jsx` - Tóm tắt đơn hàng và tạo hợp đồng
- `src/pages/dealerStaff/ViewOrders.jsx` - Xem danh sách đơn hàng
- `src/pages/dealerStaff/PaymentManagement.jsx` - Quản lý thanh toán

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Trạng thái đơn hàng để tạo hợp đồng:**
   - Một số nơi yêu cầu `CONFIRMED`
   - Một số nơi yêu cầu `APPROVED`
   - Cần kiểm tra logic backend để xác định chính xác

2. **Validation:**
   - Đơn hàng phải có ít nhất 1 sản phẩm
   - Đơn hàng phải có trạng thái phù hợp trước khi tạo hợp đồng
   - Hợp đồng phải tồn tại trước khi thanh toán

3. **Error Handling:**
   - Tất cả API calls đều có try-catch
   - Hiển thị thông báo lỗi cho người dùng
   - Log lỗi ra console để debug

4. **Response Format:**
   - Backend có thể trả về format khác nhau:
     - `{ code, message, data }`
     - Direct data object
   - Code frontend đã xử lý cả 2 trường hợp

---

## 📝 TÓM TẮT CÁC API ĐƯỢC GỌI

### Order APIs
1. `POST /api/orders/create` - Tạo đơn hàng mới
2. `POST /api/orders/create/quote` - Thêm sản phẩm và tính giá
3. `PUT /api/orders/{orderId}/confirm` - Xác nhận đơn hàng
4. `GET /api/orders/all` - Lấy tất cả đơn hàng
5. `GET /api/orders/{orderId}` - Lấy đơn hàng theo ID
6. `GET /api/orders/status/{status}` - Lấy đơn hàng theo trạng thái
7. `GET /api/orders/date-range` - Lấy đơn hàng theo khoảng thời gian
8. `PUT /api/orders/{orderId}/deliver` - Giao hàng

### Contract APIs
1. `POST /api/contracts/contracts` - Tạo hợp đồng từ đơn hàng
2. `GET /api/contracts/all` - Lấy tất cả hợp đồng
3. `GET /api/contracts/{contractId}` - Lấy hợp đồng HTML
4. `GET /api/contracts/detail/{contractId}` - Lấy chi tiết hợp đồng
5. `POST /api/contracts/{contractId}/upload-signed` - Upload hợp đồng đã ký

### Payment APIs
1. `POST /api/payment/create` - Tạo thanh toán
2. `GET /api/payment/{paymentId}` - Lấy thông tin thanh toán
3. `GET /api/payment/all` - Lấy tất cả thanh toán

---

**Tài liệu này mô tả toàn bộ luồng từ tạo đơn hàng đến thanh toán, bao gồm tất cả các API được gọi và cách chúng tương tác với nhau.**

