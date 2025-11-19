# Electra EVMS – Electric Vehicle Dealer Management System (Frontend)

**Enterprise Frontend Application – ReactJS + Vite + Redux Toolkit Query**

Electra EVMS là hệ thống quản lý bán xe điện dành cho nội bộ hãng Electra, gồm 4 vai trò chính:

- **Dealer Staff** – Nhân viên bán hàng tại đại lý
- **Dealer Manager** – Quản lý đại lý
- **EVM Staff** – Nhân viên hãng (Manufacturer Operations)
- **Admin** – Quản trị hệ thống

---

## Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- Node.js >= 18.x
- npm >= 9.x hoặc yarn >= 1.22.x
- Git
- Backend API đang chạy (nếu test local)

---

## 1. Kiến trúc hệ thống (System Architecture)

```
┌──────────────────────┐     REST API      ┌─────────────────────────┐
│     React Frontend    │  <────────────>  │        Backend API      │
│  (Dealer/Admin/EVM)   │                  │  Auth, Orders, Vehicles │
│                       │                  │                         │
│  RTK Query (fetch)    │                  │                         │
│  + Redux Store        │                  │                         │
└──────────────────────┘                   └──────────┬──────────────┘
           │                                          │
           │ JWT Auth                                 │
           │ (RTK Query interceptors)                 │
           ▼                                          ▼
     Redux Store + Cache                        Database + File Storage
     (Auto-cached by RTK Query)
```

**Đặc điểm:**
- RTK Query xử lý tất cả API calls (sử dụng fetch API, không cần Axios)
- Tự động caching và invalidation khi mutation
- Auto refetch khi cần thiết
- Backend xử lý nghiệp vụ, quản lý dữ liệu & file (hợp đồng, hình ảnh)
- Phân quyền theo vai trò nhiều cấp

---

## 2. Công nghệ sử dụng

### Frontend
- ReactJS (Vite)
- Redux Toolkit + RTK Query (Data fetching & State management)
- React Router DOM (Role-based routing)
- TailwindCSS / CSS Modules
- Recharts (báo cáo / chart)
- Lucide/Heroicons
- Prettier + ESLint

### Backend
- Spring Boot
- SQL Server
- Swagger UI
- JWT Authentication

---

## 3. Cấu trúc thư mục dự án

```
src/
├── api/
│   ├── baseApi.js                  # RTK Query base setup với interceptors
│   ├── dealerStaff/
│   │   ├── customerApi.js          # RTK Query endpoints
│   │   ├── quotationApi.js
│   │   ├── orderApi.js
│   │   ├── contractApi.js
│   │   ├── paymentApi.js
│   │   ├── vehicleApi.js
│   │   ├── testDriveApi.js
│   │   └── feedbackApi.js
│   ├── dealerManager/
│   │   ├── promotionApi.js
│   │   ├── inventoryApi.js
│   │   ├── dmOrderApi.js
│   │   └── staffApi.js
│   ├── evmStaff/
│   │   ├── productApi.js
│   │   ├── colorApi.js
│   │   ├── dealerOrdersApi.js
│   │   └── reportApi.js
│   └── admin/
│       ├── userApi.js
│       └── branchApi.js
│
├── features/
│   ├── dealerStaff/
│   │   ├── compare/
│   │   ├── customer/
│   │   ├── quotation/
│   │   ├── order/
│   │   ├── contract/
│   │   ├── payment/
│   │   ├── testDrive/
│   │   └── feedback/
│   ├── dealerManager/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── order/
│   │   ├── promotion/
│   │   └── staff/
│   ├── evmStaff/
│   │   ├── dashboard/
│   │   ├── product/
│   │   ├── color/
│   │   ├── dealerOrders/
│   │   └── report/
│   └── admin/
│       ├── dashboard/
│       ├── accounts/
│       └── branches/
│
├── components/
│   ├── ui/                        # Button, Modal, Input, Switch,...
│   ├── charts/
│   └── shared/
│
├── router/
│   ├── AppRouter.jsx
│   ├── ProtectedRoute.jsx
│   └── RoleRoute.jsx
│
├── store/
│   ├── store.js                   # Redux store với RTK Query middleware
│   └── slices/
│       ├── authSlice.js           # Auth state (không phải API)
│       └── uiSlice.js             # UI state (modals, sidebar, etc.)
│
├── hooks/
│   ├── useAppDispatch.js          # Typed hooks
│   └── useAppSelector.js
│
├── utils/
├── config/
├── constants/
└── assets/
```

---

## 4. Roles & Permissions

### Dealer Staff – Nhân viên bán hàng

| Chức năng               | Quyền |
|-------------------------|-------|
| Xem danh mục xe         | Có |
| So sánh xe (tối đa 3)   | Có |
| Tạo khách hàng          | Có |
| Tạo báo giá             | Có |
| Tạo đơn hàng            | Có |
| Tạo hợp đồng            | Có |
| In / Upload hợp đồng    | Có |
| Thanh toán (20% – 80%)  | Có |
| Lịch hẹn lái thử        | Có |
| Feedback                | Có |
| Dashboard               | Có |

### Dealer Manager – Quản lý đại lý

| Chức năng                          | Quyền |
|------------------------------------|-------|
| Dashboard đại lý                   | Có |
| Quản lý kho của đại lý             | Có |
| Quản lý khuyến mãi (vouchers)      | Có |
| Quản lý doanh thu cửa hàng         | Có |
| Xem đơn hàng cửa hàng              | Có |
| Gửi yêu cầu xe lên hãng            | Có |
| Xem danh mục xe                    | Có |

### EVM Staff – Nhân viên hãng

| Chức năng                              | Quyền |
|----------------------------------------|-------|
| Dashboard hãng                         | Có |
| Quản lý sản phẩm (model/variant/specs) | Có |
| Quản lý màu sắc                        | Có |
| Xử lý đơn hàng từ đại lý               | Có |
| Báo cáo bán hàng toàn hệ thống         | Có |

### Admin – Quản trị hệ thống

| Chức năng                                 | Quyền |
|-------------------------------------------|-------|
| Dashboard hệ thống                        | Có |
| Quản lý tài khoản user (3 role còn lại)   | Có |
| Quản lý chi nhánh (branches)              | Có |

---

## 5. Business Workflow – Luồng nghiệp vụ quan trọng

### Dealer Staff – Quy trình bán xe

1. So sánh xe → highlight thông số vượt trội
2. Chọn xe → chọn màu → số lượng
3. Tìm khách hàng theo số điện thoại,tên
4. Nếu chưa tồn tại → tạo mới
5. Áp dụng khuyến mãi + tạo báo giá
6. Khách đồng ý → chuyển thành đơn hàng
7. Tạo hợp đồng → in → ký → upload
8. Thanh toán 20% đặt cọc
9. Thanh toán 80% còn lại
10. Giao xe
11. Ghi nhận feedback

### Dealer Manager – Quy trình vận hành cửa hàng

1. Xem dashboard tổng quan
2. Quản lý kho đại lý (inventory)
3. Tạo + quản lý khuyến mãi
4. Xem doanh thu cửa hàng
5. Gửi yêu cầu xe lên hãng


### EVM Staff – Quy trình vận hành hãng

1. Quản lý sản phẩm (model/variants)
2. Quản lý màu sắc xe
3. Xem & xử lý đơn hàng đại lý
4. Báo cáo doanh số toàn quốc
5. xem dashboard tổng quan

### Admin – Quy trình quản trị

1. Tạo tài khoản cho Staff / Manager / EVM
2. Tạo + quản lý chi nhánh
3. Theo dõi hoạt động hệ thống

---

## 6. Cài đặt và chạy dự án

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint code

```bash
npm run lint
```

### Format code

```bash
npm run format
```

---

## 7. Environment Variables

Tạo file `.env` hoặc `.env.local` trong thư mục root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_SECRET_KEY=your-secret-key-here
VITE_JWT_STORAGE_KEY=electra_token

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

**Lưu ý:** Không commit file `.env` vào Git. Sử dụng `.env.example` làm template.

---

## 8. API Documentation

Backend API được document tại Swagger UI:

- Development: `http://localhost:8080/swagger-ui.html`
- Production: `https://api.electra-evms.com/swagger-ui.html`

Tất cả API endpoints được định nghĩa trong `src/api/` theo từng role sử dụng RTK Query.

---

## 9. RTK Query Setup & Usage

### Base API Configuration

RTK Query được cấu hình trong `src/api/baseApi.js` với:
- JWT authentication interceptors
- Error handling tự động
- Base URL từ environment variables
- Tag-based cache invalidation

### Example: Customer API

```javascript
// src/api/dealerStaff/customerApi.js
import { baseApi } from '../baseApi';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      providesTags: ['Customer'],
    }),
    createCustomer: builder.mutation({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
} = customerApi;
```

### Usage in Component

```javascript
import { useGetCustomersQuery, useCreateCustomerMutation } from '@/api/dealerStaff/customerApi';

function CustomerList() {
  const { data, isLoading, error, refetch } = useGetCustomersQuery({ page: 1 });
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const handleCreate = async (customerData) => {
    try {
      await createCustomer(customerData).unwrap();
      // Tự động refetch vì invalidatesTags
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

### RTK Query Features

- Automatic caching - Data được cache tự động
- Auto refetch - Tự động refetch khi mutation thành công
- Loading states - isLoading, isFetching tự động
- Error handling - Error states được quản lý tự động
- Optimistic updates - Hỗ trợ optimistic updates
- Pagination - Hỗ trợ pagination và infinite scroll
- Polling - Có thể polling data tự động

---

## 10. Coding Convention

### Naming

| Loại | Quy tắc |
|------|---------|
| Component | PascalCase |
| Functions | camelCase |
| API files | camelCase (customerApi.js) |
| RTK Query endpoints | camelCase (getCustomers, createCustomer) |
| Redux slice | camelCase (authSlice.js) |
| Folder | camelCase |
| File JS | camelCase |

### Prettier chuẩn

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### ESLint chuẩn

- Không để code smell
- Không để file > 300 dòng
- Tách logic khỏi UI component
- RTK Query endpoints nên được group theo feature

---

## 11. Branching Convention

- `feature/ds-quotation` - Feature cho Dealer Staff
- `feature/dm-promotion` - Feature cho Dealer Manager
- `feature/evm-product` - Feature cho EVM Staff
- `feature/admin-accounts` - Feature cho Admin
- `fix/order-payment` - Fix bug
- `refactor/api-structure` - Refactor code
- `hotfix/critical-bug` - Hotfix khẩn cấp

**Workflow:**
1. Tạo branch từ `develop`
2. Commit theo convention: `feat: add quotation feature`
3. Push và tạo Pull Request
4. Đợi code review và merge

---

## 12. Test & QA Standards

- UI tối thiểu 60 FPSnnn
- Không để lỗi console
- Tất cả RTK Query hooks phải có error handling
- Form phải có validation
- Responsive trên mobile/tablet/desktop
- Cross-browser testing (Chrome, Firefox, Edge)
- RTK Query cache được quản lý đúng (không memory leak)

---

## 13. Onboarding Dev mới

1. Clone repo: `git clone [repo-url]`
2. Tạo `.env` từ `.env.example`
3. `npm install`
4. `npm run dev`
5. Đọc Swagger để hiểu API
6. Đọc RTK Query documentation: https://redux-toolkit.js.org/rtk-query/overview
7. Bắt đầu theo thư mục `features/<role>/<module>`
8. Tham khảo `src/api/baseApi.js` để hiểu setup
9. Xem example trong `src/api/dealerStaff/customerApi.js`
10. Đọc coding convention ở mục 10

---

## 14. Troubleshooting

### Lỗi kết nối API

- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings trên backend
- Kiểm tra network tab trong DevTools
- Xem Redux DevTools để kiểm tra RTK Query state

### Lỗi build

- Xóa `node_modules` và `package-lock.json`
- Chạy `npm install` lại
- Kiểm tra Node.js version: `node -v` (phải >= 18.x)
- Xóa cache: `npm cache clean --force`

### Lỗi JWT/Authentication

- Kiểm tra token trong Redux state (Redux DevTools)
- Xóa token cũ và login lại
- Kiểm tra `baseApi.js` - phần `prepareHeaders`
- Kiểm tra backend JWT validation

### RTK Query không refetch

- Kiểm tra `invalidatesTags` trong mutation
- Kiểm tra `providesTags` trong query
- Đảm bảo tags được định nghĩa trong `baseApi.js`
- Xem Redux DevTools để debug cache state

### Lỗi import/module

- Kiểm tra đường dẫn import (relative vs absolute)
- Đảm bảo file extension đúng (.js, .jsx)
- Restart dev server
- Kiểm tra `vite.config.js` cho path aliases

---

## 15. Project Status

- Architecture & Setup
- README Documentation
- RTK Query Base Configuration
- Dealer Staff Features (In Progress)
- Dealer Manager Features (Planned)
- EVM Staff Features (Planned)
- Admin Features (Planned)

---

## 16. Resources & Documentation

- RTK Query Docs: https://redux-toolkit.js.org/rtk-query/overview
- Redux Toolkit Docs: https://redux-toolkit.js.org/
- React Router: https://reactrouter.com/
- Vite Docs: https://vitejs.dev/
- TailwindCSS: https://tailwindcss.com/

---

