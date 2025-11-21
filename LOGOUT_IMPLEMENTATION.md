# 🚪 Logout Implementation Summary

## ✅ Đã Implementation

### 1. **API Logout Endpoint**
- **Endpoint**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Location**: `src/api/auth/authApi.js`

```javascript
logout: build.mutation({
  query: () => ({
    url: '/auth/logout',
    method: 'POST',
  }),
}),
```

### 2. **Token Management**
- **Auto-attach token**: Token được tự động attach vào header qua `baseApi.js`
- **Token storage**: Lưu trong `localStorage` và `sessionStorage` (role-based)
- **Token cleanup**: Xóa token sau khi logout thành công

### 3. **Logout Flow Implementation**
Tất cả layout components đã được cập nhật với flow chuẩn:

```javascript
const handleLogout = async () => {
  try {
    // 1. Gọi logout API với token để revoke token trên server
    await logoutMutation().unwrap();
    console.log('✅ Logout API successful - token revoked on server');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Logout API error:', error);
    }
    // Vẫn tiếp tục logout locally dù API fail
  } finally {
    // 2. Clear auth state và storage
    dispatch(logout());
    // 3. Redirect to login
    navigate('/login', { replace: true });
  }
};
```

### 4. **Updated Components**
- ✅ `src/components/layout/Header.jsx`
- ✅ `src/components/layout/Sidebar.jsx` 
- ✅ `src/components/layout/DealerStaffLayout.jsx`
- ✅ `src/components/layout/DealerManagerLayout.jsx`
- ✅ `src/components/layout/EVMStaffLayout.jsx`

### 5. **Auth State Management**
- **Redux slice**: `src/store/slices/authSlice.js`
- **Logout action**: Xóa token từ cả localStorage và sessionStorage
- **Auto-redirect**: Chuyển về `/login` sau logout

### 6. **Testing Component**
- **Component**: `src/components/shared/LogoutTester.jsx`
- **Location**: Hiển thị trong DealerStaff Dashboard (chỉ trong dev mode)
- **Features**:
  - Test API call trước logout
  - Gọi logout API
  - Test API call sau logout (expect 401)
  - Real-time results display

## 🔄 Expected Flow

```
1. User login → Nhận access token
2. User gọi API → Token hợp lệ → OK
3. User logout → Gọi POST /auth/logout với Bearer token
4. Server revoke token → Token vào blacklist
5. Clear token khỏi localStorage/sessionStorage
6. Redirect về /login
7. User gọi API với token cũ → 401 Unauthorized (Token has been revoked)
```

## 🧪 How to Test

### Method 1: Using LogoutTester Component
1. Login vào hệ thống với role `DEALER_STAFF`
2. Vào Dashboard page
3. Scroll xuống dưới để thấy "Logout Flow Tester" (chỉ hiển thị trong dev mode)
4. Click "Run Logout Test"
5. Xem kết quả test real-time

### Method 2: Manual Testing
1. Login và lấy token từ localStorage
2. Test API call: `GET /users/me` với token → Should return 200
3. Call logout: `POST /auth/logout` với token → Should return 200
4. Test API call lại: `GET /users/me` với token cũ → Should return 401

### Method 3: Browser Console
```javascript
// Paste this in browser console after login
const token = localStorage.getItem('accessToken');
const API_URL = 'https://tiembanhvuive.io.vn/api';

// Test before logout
fetch(`${API_URL}/users/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => console.log('Before logout:', r.status));

// Logout
fetch(`${API_URL}/auth/logout`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => console.log('Logout:', r.status));

// Test after logout (wait a moment)
setTimeout(() => {
  fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => console.log('After logout:', r.status)); // Should be 401
}, 1000);
```

## 🔧 Technical Details

### Token Handling in baseApi.js
- Token được tự động attach vào mọi API request
- Hỗ trợ multi-role token storage
- Auto-cleanup khi nhận 401 response

### Error Handling
- Graceful fallback: Logout locally dù API fail
- Console logging trong dev mode
- User-friendly error messages

### Security Features
- Token revocation trên server
- Immediate token cleanup
- Prevent reuse của revoked tokens

## 📝 Notes

- LogoutTester component chỉ hiển thị trong development mode
- Tất cả layout components đã được chuẩn hóa với cùng logout flow
- Hỗ trợ cả localStorage và sessionStorage cleanup
- Auto-redirect với `replace: true` để tránh back button issues

