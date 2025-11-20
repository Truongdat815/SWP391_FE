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
    'NHAN VIEN CUA HANG': 'DEALER_STAFF',
    'NHÂN VIÊN BÁN HÀNG': 'DEALER_STAFF',
    'NHAN VIEN BAN HANG': 'DEALER_STAFF',
    'QUẢN LÝ ĐẠI LÝ': 'DEALER_MANAGER',
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

