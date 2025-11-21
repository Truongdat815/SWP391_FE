/**
 * Utility functions for role management and routing
 */

/**
 * Normalize role name to standard format
 * Handles various formats: 'ADMIN', 'Admin', 'admin', 'Quản trị viên', etc.
 */
export const normalizeRole = (roleName) => {
  if (!roleName) return null;
  
  const role = roleName.toString().trim().toUpperCase();
  
  // Map Vietnamese role names to English
  const roleMap = {
    'QUẢN TRỊ VIÊN': 'ADMIN',
    'QUAN TRI VIEN': 'ADMIN',
    'NHÂN VIÊN ĐẠI LÝ': 'DEALER_STAFF',
    'NHÂN VIÊN CỬA HÀNG': 'DEALER_STAFF',
    'NHÂN VIÊN BÁN HÀNG': 'DEALER_STAFF',
    'NHAN VIEN BAN HANG': 'DEALER_STAFF',
    'QUẢN LÝ CỬA HÀNG': 'DEALER_MANAGER',
    'QUAN LY DAI LY': 'DEALER_MANAGER',
    'QUẢN LÝ CỬA HÀNG': 'DEALER_MANAGER',
    'QUAN LY CUA HANG': 'DEALER_MANAGER',
    'NHÂN VIÊN HÃNG XE': 'EVM_STAFF',
    'NHAN VIEN EVM': 'EVM_STAFF',
  };
  
  // Check if it's a Vietnamese role name
  if (roleMap[role]) {
    return roleMap[role];
  }
  
  // Handle English role names
  if (role === 'ADMIN' || role === 'ADMINISTRATOR') {
    return 'ADMIN';
  }
  
  if (role === 'DEALER_STAFF' || role === 'DEALERSTAFF' || role === 'STAFF') {
    return 'DEALER_STAFF';
  }
  
  if (role === 'DEALER_MANAGER' || role === 'DEALERMANAGER' || role === 'MANAGER') {
    return 'DEALER_MANAGER';
  }
  
  if (role === 'EVM_STAFF' || role === 'EVMSTAFF' || role === 'EVM') {
    return 'EVM_STAFF';
  }
  
  // Handle "Dealer Staff", "Dealer Manager" format
  if (role.includes('DEALER') && role.includes('STAFF')) {
    return 'DEALER_STAFF';
  }
  
  if (role.includes('DEALER') && role.includes('MANAGER')) {
    return 'DEALER_MANAGER';
  }
  
  if (role.includes('EVM') && role.includes('STAFF')) {
    return 'EVM_STAFF';
  }
  
  return role;
};

/**
 * Get dashboard route based on role
 */
export const getRoleDashboardRoute = (roleName) => {
  const normalizedRole = normalizeRole(roleName);
  
  const routeMap = {
    'ADMIN': '/admin/dashboard',
    'DEALER_STAFF': '/dealer-staff/dashboard',
    'DEALER_MANAGER': '/dealer-manager/dashboard',
    'EVM_STAFF': '/evm-staff/dashboard',
  };
  
  return routeMap[normalizedRole] || '/';
};

/**
 * Check if user has required role
 */
export const hasRole = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }
  
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRoles = requiredRoles.map(role => normalizeRole(role));
  
  return normalizedRequiredRoles.includes(normalizedUserRole);
};

/**
 * Get role display name (Vietnamese)
 */
export const getRoleDisplayName = (roleName) => {
  const normalizedRole = normalizeRole(roleName);
  
  const displayNames = {
    'ADMIN': 'Quản trị viên',
    'DEALER_STAFF': 'Nhân viên bán hàng',
    'DEALER_MANAGER': 'Quản lý đại lý',
    'EVM_STAFF': 'Nhân viên EVM',
  };
  
  return displayNames[normalizedRole] || roleName;
};

/**
 * Get role from URL path
 */
export const getRoleFromPath = (pathname) => {
  if (pathname.includes('/admin/')) return 'ADMIN';
  if (pathname.includes('/dealer-staff/')) return 'DEALER_STAFF';
  if (pathname.includes('/dealer-manager/')) return 'DEALER_MANAGER';
  if (pathname.includes('/evm-staff/')) return 'EVM_STAFF';
  return null;
};

/**
 * LocalStorage utility functions for role-based auth with expiration
 */
export const getAuthStorageKey = (role) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? `auth_${normalizedRole}` : 'auth_default';
};

export const getAuthFromStorage = (role) => {
  const key = getAuthStorageKey(role);
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    const authData = JSON.parse(data);
    
    // Check if token has expiration and if it's expired
    if (authData.expiresAt && Date.now() > authData.expiresAt) {
      // Token expired, remove it
      removeAuthFromStorage(role);
      return null;
    }
    
    return authData;
  } catch {
    return null;
  }
};

export const setAuthToStorage = (role, authData, rememberMe = true) => {
  const key = getAuthStorageKey(role);
  
  // Add expiration time based on rememberMe option
  const expirationTime = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000  // 30 days for "Remember Me"
    : 24 * 60 * 60 * 1000;      // 24 hours for regular login
  
  const dataToStore = {
    ...authData,
    expiresAt: Date.now() + expirationTime,
    rememberMe
  };
  
  localStorage.setItem(key, JSON.stringify(dataToStore));
};

export const removeAuthFromStorage = (role) => {
  const key = getAuthStorageKey(role);
  localStorage.removeItem(key);
};

export const getAllAuthRoles = () => {
  const roles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('auth_')) {
      const role = key.replace('auth_', '');
      roles.push(role);
    }
  }
  return roles;
};

/**
 * Check if any stored auth tokens are expired and clean them up
 */
export const cleanupExpiredTokens = () => {
  const roles = getAllAuthRoles();
  roles.forEach(role => {
    const authData = getAuthFromStorage(role);
    // getAuthFromStorage already handles cleanup of expired tokens
  });
};

/**
 * Get token expiration info
 */
export const getTokenExpirationInfo = (role) => {
  const key = getAuthStorageKey(role);
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    const authData = JSON.parse(data);
    if (authData.expiresAt) {
      const now = Date.now();
      const expiresAt = authData.expiresAt;
      const isExpired = now > expiresAt;
      const timeUntilExpiry = expiresAt - now;
      
      return {
        expiresAt,
        isExpired,
        timeUntilExpiry,
        rememberMe: authData.rememberMe || false
      };
    }
  } catch {
    return null;
  }
  
  return null;
};

